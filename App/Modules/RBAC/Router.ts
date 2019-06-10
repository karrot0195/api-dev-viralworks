import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { RoleController } from './Controllers/RoleController';

import { AuthenticationMiddleware } from './Middlewares/AuthenticationMiddleware';
import { GuestMiddleware } from './Middlewares/GuestMiddleware';
import { InternalMiddleware } from './Middlewares/InternalMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly roleController: RoleController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddelware: GuestMiddleware,
        readonly internalMiddleware: InternalMiddleware
    ) {
        this.routes = [
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/permissions/{id}', method: HTTP.Put, handler: this.roleController.updatePermission },
                    { path: '/permissions/{id}', method: HTTP.Get, handler: this.roleController.getPermissionById },
                    { path: '/permissions', method: HTTP.Get, handler: this.roleController.getPermissions },

                    { path: '/roles/{id}', method: HTTP.Put, handler: this.roleController.updateRole },
                    { path: '/roles/{id}', method: HTTP.Get, handler: this.roleController.getRoleById },
                    { path: '/roles/{id}', method: HTTP.Delete, handler: this.roleController.deleteRoleById },
                    { path: '/roles', method: HTTP.Post, handler: this.roleController.createRole },
                    { path: '/roles', method: HTTP.Get, handler: this.roleController.getRoles },

                    { path: '/paths', method: HTTP.Get, handler: this.roleController.getPaths }
                ]
            },
            {
                middleware: [{ class: this.guestMiddelware }, { class: this.internalMiddleware }],
                group: [{ path: '/update-rbac', method: HTTP.Get, handler: this.roleController.updateRBAC }]
            }
        ];
    }
}
