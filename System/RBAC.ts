import * as _ from 'lodash';
import { Request, Response, NextFunction } from 'express';

import { Injectable } from './Injectable';
import { Config } from './Config';
import * as RE from './RegularExpression';
import { SystemError, Forbidden, Unauthorized } from './Error';
import { HTTP } from './Enum';
import { IRoutePath } from './Interface/RBAC';
import { Role } from './RBAC/Schema/RoleSchema';
import { Permission } from './RBAC/Schema/PermissionSchema';
import { RoleBasedAccessControlService as Service } from './RBAC/Service';

@Injectable
export class RoleBasedAccessControl {
    private _roles: Role[];
    private _permissions: Permission[];

    constructor(
        private readonly _config: Config,
        private readonly _service: Service,
    ) { }

    async load() {
        this._roles = await this._service.findRoles();
        this._permissions = await this._service.findPermissions();
    }

    addRoutePath(moduleName: string, path: string, method: HTTP, description?: string) {
        if (!RE.checkModuleName.test(moduleName)) {
            throw new SystemError(`Module name "${moduleName}" is invalid format. It must be ${RE.checkModuleName}`);
        }

        if (!RE.checkRoutePath.test(path)) {
            throw new SystemError(`Path "${path}" is invalid format. It must be ${RE.checkRoutePath}`);
        }

        if (!this._service.routePathsWithModule[moduleName]) {
            this._service.routePathsWithModule[moduleName] = [];
        }

        this._service.routePathsWithModule[moduleName].push({ path, method, description });
        this._service.routePaths.push({ path, method, description });
        this._service.paths.push(path);
    }

    private _handler(path: string, method: string, roleId?: string) {
        // Find permission by path and method
        const permission = this._permissions.find(item => item.route.path == path && item.route.method == method);

        // Permission doesn't exist or doesn't have roles = Permit all
        if (permission && permission.roles.length > 0) {
            if (roleId) {
                // Check role Id
                if (permission.roles.indexOf(roleId) > -1) {
                    return true;
                } else {
                    // Check parent role Id
                    const role = this._roles.find(item => item.id == roleId);

                    if (role && role.parents.length > 0) {
                        return permission.roles.some(item => {
                            return role.parents.indexOf(item) > -1 ? true : false;
                        });
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    middleware(req: Request, res: Response, next: NextFunction) {
        if (this._config.env == 'dev' && req.auth.role && req.auth.role == 'admin') {
            return next();
        }

        const result = this._handler(req.routePath, req.method.toLowerCase(), req.auth.role);

        if (result == true) {
            return next();
        } else {
            return next(new Unauthorized('Please authorize your request before do this action'));
        }
    }
}