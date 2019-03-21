import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { Injectable } from "./Injectable";
import { Config } from "./Config";
import { IRoute, IRouteModule } from "./Interface";
import { IObjectOfArraySchema, IObjectSchema } from './Interface/Swagger';
import { DataType } from './Enum/Swagger';

@Injectable
export class Swagger {
    private readonly _schemas: any[] = [];
    readonly opts: any = {
        explorer: true,
        swaggerOptions: {
            deepLinking: true,
            urls: []
        }
    };

    constructor(private readonly _config: Config) { }

    public createSchema(moduleName: string, routeModule: IRouteModule, routes: IRoute[]) {
        const serverConf = this._config.server;
        const docConf = this._config.document;

        // Initialize Swagger Schema
        const swaggerSchema = this._initSchema({
            title: capitalize(moduleName) + ' Module',
            description: routeModule.description,
            basePath: removeDivision(routeModule.path)
        });

        // Resolve Swagger Path from Routes
        swaggerSchema.paths = this._resolveRoute(routeModule, routes);

        // Create Swagger file and set Swagger Express Options
        const modulePath = `${docConf.path}/modules/${moduleName.toLowerCase()}`;
        const url = `${serverConf.schema}://${serverConf.public.host}:${serverConf.public.port}/${this._config.version}/${modulePath}`;
        this.opts.swaggerOptions.urls.push({ url, name: capitalize(moduleName) });

        if (!this.opts.swaggerUrl) {
            this.opts.swaggerUrl = url;
        }

        this._schemas.push(swaggerSchema);

        return { path: modulePath, schema: swaggerSchema };
    }

    private _resolveRoute(routeModule: IRouteModule, routes: IRoute[]) {
        const paths: any = {};

        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const path = route.path!.replace('/' + removeDivision(routeModule.path), '');

            const document: any = Object.assign({}, route.handler!.document);

            if (document.security == true) {
                document.security = [{ JWT: [] }];
            }

            let params = {};

            if (route.handler!.validation) {
                params = this._resolveParams(route);
            }

            if (params) {
                document.parameters = params;
            }

            const responses = this._initResponses(route.method!);

            if (document.responses) {
                document.responses = Object.assign(responses, document.responses);
            } else {
                document.responses = responses;
            }

            for (const code in document.responses) {
                document.responses[code] = { description: document.responses[code] };
            }

            if (!paths[path]) {
                paths[path] = {};
            }

            paths[path][route.method!] = document;
        }

        return paths;
    }

    private _initResponses(method: string) {
        const responses = {
            400: 'Bad Request',
            401: 'Unauthorize',
            403: 'Forbiddon',
            405: 'Method Not Allowed',
            406: 'Not Acceptable',
            500: 'Internal Error'
        };

        if (method == 'post') {
            return Object.assign(responses, {
                201: 'Created',
                409: 'Conflict'
            });
        } else {
            return Object.assign(responses, {
                200: 'OK',
                404: 'Not Found'
            });
        }
    }

    private _resolveParams(route: IRoute) {
        const validation = _.cloneDeep(route.handler!.validation!);
        const params: any[] = [];

        for (const pos in validation) {
            if (pos == 'body') continue;

            for (const field in validation[pos]) {
                const schema = validation[pos][field];
                const temp: any = Object.assign({
                    in: pos,
                    name: field,
                }, schema);

                params.push(temp);
            }
        }

        if (validation.body) {
            const schema = {};

            if (validation.body.type == DataType.Object) {
                const temp = this._resolveObjectType(validation.body);
                Object.assign(schema, temp);
            } else if (validation.body.type == DataType.Array && validation.body.items.type == DataType.Object) {
                const temp = this._resolveObjectType(validation.body.items);
                Object.assign(validation.body.items, temp);
                Object.assign(schema, validation.body);
            } else {
                Object.assign(schema, validation.body);
            }

            const temp: any = Object.assign({
                in: 'body',
                name: 'body',
                required: true
            }, { schema });

            params.push(temp);
        }

        return params;
    }

    private _resolveObjectType(schema: IObjectSchema | IObjectOfArraySchema) {
        const resolvedSchema = {
            type: DataType.Object,
            required: [] as string[],
            properties: {}
        };

        for (const field in schema.properties) {
            const prop = schema.properties[field];

            if (prop.type == DataType.Object) {
                resolvedSchema.properties[field] = this._resolveObjectType(prop);
            } else if (prop.type == DataType.Array && prop.items.type == DataType.Object) {
                const temp = this._resolveObjectType(prop.items);
                Object.assign(prop.items, temp);
                resolvedSchema.properties[field] = prop;
            } else {
                resolvedSchema.properties[field] = prop;
            }

            if (prop.required) {
                resolvedSchema.required.push(field);
                delete resolvedSchema.properties[field].required;
            }
        }

        return resolvedSchema;
    }

    private _initSchema(opts?: { title?: string, description?: string, schema?: string[], version?: string, host?: string, port?: number, basePath?: string }) {
        return {
            swagger: '2.0',
            info: {
                title: (opts!.title || ''),
                description: opts!.description || '',
                version: opts!.version || this._config.version
            },
            schema: opts!.schema || [this._config.server.schema],
            host: `${opts!.host || this._config.server.public.host}:${opts!.port || this._config.server.public.port}`,
            basePath: `/${this._config.version}/${opts!.basePath || ''}`,
            securityDefinitions: {
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization'
                }
            },
            paths: {}
        };
    }
}

function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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