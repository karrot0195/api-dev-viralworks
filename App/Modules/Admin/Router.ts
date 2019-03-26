import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { AuthController } from './Controllers/AuthController';
import { RoleController } from './Controllers/RoleController';
import { UserController } from './Controllers/UserController';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly roleController: RoleController,
        readonly authController: AuthController,
        readonly userController: UserController,

        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware
    ) {
        this.routes = [
            { path: '/auth', method: HTTP.Post, handler: this.authController.postLogin },
            { path: '/users', method: HTTP.Post, handler: this.userController.createUser },
            { path: '/users/{id}', method: HTTP.Get, handler: this.userController.getUserById },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/auth/check', method: HTTP.Get, handler: this.authController.getCheckToken },
                    { path: '/paths', method: HTTP.Get, handler: this.roleController.getPaths },
                    { path: '/rules', method: HTTP.Get, handler: this.roleController.getRules },
                    { path: '/rules', method: HTTP.Post, handler: this.roleController.setPermission },
                    { path: '/rules/search/{term}', method: HTTP.Get, handler: this.roleController.searchRules },
                    { path: '/roles/{id}', method: HTTP.Get, handler: this.roleController.getRoleById },
                    { path: '/roles/{id}', method: HTTP.Put, handler: this.roleController.updateRole },
                    { path: '/roles/{id}', method: HTTP.Delete, handler: this.roleController.deleteRoleById },
                    { path: '/roles', method: HTTP.Post, handler: this.roleController.createRole },
                    { path: '/roles', method: HTTP.Get, handler: this.roleController.getRoles }
                ]
            }
        ];
    }
}