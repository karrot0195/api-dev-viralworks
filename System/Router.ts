import { Router as ExpressRouter, Request, Response, NextFunction } from "express";
import * as Validator from 'is-my-json-valid';

import { DataType } from './Enum';
import { Config } from 'System/Config';
import { Injectable } from './Injectable';
import { IRoute, IRouteMiddleware, IRouteModule } from './Interface';
import { IStringSchema, IIntegerSchema, INumberSchema, IBooleanSchema, ISchema, IObjectSchema } from './Interface/Swagger';
import { Swagger } from './Swagger';
import { RoleBasedAccessControl as RBAC } from './RBAC';
import { BadRequest, SystemError, NotAcceptable } from "./Error";
import * as RE from './RegularExpression';

import { Router as AppRouter } from 'App/Router';

@Injectable
export class Router {
    readonly expressRouter: ExpressRouter = ExpressRouter();
    readonly routes: { [module: string]: IRoute[] } = {};

    constructor(appRouter: AppRouter, private readonly _swagger: Swagger, private readonly _rbac: RBAC, private readonly _config: Config) {
        for (const moduleName in appRouter.routes) {
            if (!RE.checkModuleName.test(moduleName)) {
                throw new SystemError(`Module name "${moduleName}" is invalid format. It must be ${RE.checkModuleName}`);
            }

            const routeModule = appRouter.routes[moduleName];
            this.routes[moduleName] = [];
            this._resolve(routeModule, moduleName);

            if (_config.document.enable) {
                this._createDocumentURL(moduleName, routeModule);
            }
        }
    }

    private _createDocumentURL(moduleName: string, routeModule: IRouteModule) {
        const { path, schema } = this._swagger.createSchema(moduleName, routeModule, this.routes[moduleName]);

        this.expressRouter.get('/' + path, (req: Request, res: Response) => {
            return res.json(schema);
        });
    }

    private _resolve(route: IRoute, moduleName: string, parent?: { middlewares?: IRouteMiddleware[], paths?: string[] }): IRoute | void | undefined {
        const paths: string[] = [];
        const middlewares: IRouteMiddleware[] = route.middleware || [];

        if (route.path) {
            paths.push(route.path);
        }

        if (parent) {
            if (parent.paths) {
                paths.unshift(...parent.paths);
            }

            if (parent.middlewares) {
                middlewares.unshift(...parent.middlewares);
            }
        }

        if (route.group) {
            for (let i = 0; i < route.group.length; i++) {
                this._resolve(route.group[i], moduleName, { middlewares, paths });
            }
        } else if (route.method && route.handler) {
            if (paths && paths.length > 0) {
                const resolvedRoute: IRoute = { path: resolvePath(paths), method: route.method, handler: route.handler, middleware: resolveMiddleware(middlewares) };
                if (RE.checkRoutePath.test(resolvedRoute.path!)) {
                    let summary: string | undefined;

                    if (resolvedRoute.handler!.document) {
                        summary = resolvedRoute.handler!.document.summary;
                    }

                    this._rbac.addRoutePath(moduleName, resolvedRoute.path!, resolvedRoute.method!, summary);
                    this.routes[moduleName].push(resolvedRoute);
                    this._setExpressRoute(resolvedRoute);
                } else {
                    throw new SystemError(`Path "${resolvedRoute.path!}" is invalid format. It must be ${RE.checkRoutePath}`);
                }
            }
        }
    }

    private _resolveValidation(req: Request, next: NextFunction, route: IRoute) {
        const validation = route.handler!.validation!;
        const valiOpts = {
            greedy: true,
            formats: {
                // email: /^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,6}){1,2}$/gm,
            }
        };

        for (const pos in validation) {

            let expressPos = pos;

            if (pos == 'path') {
                expressPos = 'params';
            } else if (pos == 'header') {
                expressPos = 'headers';
            }

            let param: ISchema;
            if (validation.body && pos == 'body') {
                param = validation.body;
            } else {
                param = this._resolveNonSchemaValidation(req[expressPos], validation[pos]);
            }

            const validate = Validator(param, valiOpts);
            const valid = validate(req[expressPos]);

            if (!valid) {
                const errors = convertValidationError(validate.errors);
                return next(new BadRequest({ in: pos, fields: errors }));
            }
        }

        return next();
    }

    private _resolveNonSchemaValidation(requestPosition: any, params: { [field: string]: IStringSchema | IIntegerSchema | INumberSchema | IBooleanSchema }) {
        const schema: IObjectSchema = {
            type: DataType.Object,
            properties: {} as { [field: string]: IStringSchema | IIntegerSchema | INumberSchema | IBooleanSchema }
        };

        for (const field in params) {
            const param = params[field];

            if (['integer', 'number'].indexOf(param.type) > -1) {
                requestPosition[field] = Number(requestPosition[field]);
            }

            Object.assign(schema.properties, { [field]: param });
        }

        return schema;
    }

    private _setExpressRoute(route: IRoute) {
        let expressPath = route.path!;
        const result = expressPath.match(RE.getParamsInRoutePath);

        if (result) {
            result.map(val => {
                let temp = ':' + val.replace(/{/g, '').replace(/}/g, '');
                expressPath = expressPath.replace(val, temp);
                return { old: val, new: temp };
            });
        }

        // Set extends variable Request
        this.expressRouter[route.method!](expressPath, (req: Request, res: Response, next: NextFunction) => {
            req.routePath = route.path!;
            return next();
        });

        // Set middleware to Express Route
        if (route.middleware) {
            for (let i = 0; i < route.middleware.length; i++) {
                const middleware = route.middleware[i];

                this.expressRouter[route.method!](expressPath, (req: Request, res: Response, next: NextFunction) => {
                    return middleware.class.handle.bind(middleware.class)(req, next, middleware.params);
                });
            }
        }

        // Set RBAC to Express Route if it's enabled
        if (this._config.security.RBAC) {
            this.expressRouter[route.method!](expressPath, this._rbac.middleware.bind(this._rbac));
        }

        // Set Validation to Express Route if it's available
        if (route.handler!.validation) {
            this.expressRouter[route.method!](expressPath, (req: Request, res: Response, next: NextFunction) => {
                return this._resolveValidation.bind(this)(req, next, route);
            });
        }

        // Set Policy to Express Route if it's available
        if (route.handler!.policy) {
            this.expressRouter[route.method!](expressPath, async (req: Request, res: Response, next: NextFunction) => {
                const result = await route.handler!.policy!(req);

                if (result === true) {
                    return next();
                } else {
                    return next(new NotAcceptable('Your request was not accepted by policy'));
                }
            });
        }

        // Set handler function to resolve request to Express Route
        this.expressRouter[route.method!](expressPath, wrapper(route.handler!.method));
        // this.expressRouter.route(expressPath)[route.method!](wrapper(route.handler!.method));
    }
}

function convertValidationError(errors: Validator.Error[]) {
    const dict: { [field: string]: string } = {};

    for (const error of errors) {
        dict[error.field.replace(/^data\./, '')] = error.message;
    }

    return dict;
}

function wrapper(fn: Function) {
    return (req: Request, res: Response, next?: NextFunction) => fn(req, res).catch(next);
}

function removeDivision(str: string) {
    let temp = str;
    if (str[0] == '/') {
        temp = temp.substring(1);
    }

    if (temp[temp.length - 1] == '/') {
        temp = temp.substring(0, temp.length - 1);
    }

    while (temp.indexOf('//') > -1) {
        temp = temp.replace('//', '/');
    }

    return temp;
}

function resolvePath(paths: string[]) {
    let temp = '';
    for (let i = 0; i < paths.length; i++) {
        if (paths[i] && !!paths[i].trim() && paths[i] !== '/') {
            const path = removeDivision(paths[i]);
            temp += '/' + path;
        }
    }
    return temp;
}

function resolveMiddleware(middlewares: IRouteMiddleware[]) {
    const temp: IRouteMiddleware[] = [];

    for (let i = 0; i < middlewares.length; i++) {
        const middleware = middlewares[i];
        let duplicate = false;
        for (let j = 0; j < temp.length; j++) {
            if (temp[j].class == middleware.class) {
                duplicate = true;
                break;
            }
        }

        if (!duplicate) {
            temp.push(middleware);
        }
    }

    return temp;
}