import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { AuthController } from './Controllers/AuthController';
import { RoleController } from './Controllers/RoleController';
import { UserController } from './Controllers/UserController';
import { FaqController } from './Controllers/FaqController';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly roleController: RoleController,
        readonly authController: AuthController,
        readonly userController: UserController,
        readonly faqController: FaqController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware
    ) {
        this.routes = [
            { path: '/auth', method: HTTP.Post, handler: this.authController.postLogin },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/auth/check', method: HTTP.Get, handler: this.authController.getCheckToken }
                ]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/paths', method: HTTP.Get, handler: this.roleController.getPaths },

                    { path: '/entries/create', method: HTTP.Post, handler: this.roleController.createPermission },
                    { path: '/entries/update/{id}', method: HTTP.Put, handler: this.roleController.updatePermission },
                    { path: '/entries/{id}', method: HTTP.Get, handler: this.roleController.getPermissionById },
                    { path: '/entries', method: HTTP.Get, handler: this.roleController.getPermissions },

                    { path: '/roles/create', method: HTTP.Post, handler: this.roleController.createRole },
                    { path: '/roles/update/{id}', method: HTTP.Put, handler: this.roleController.updateRole },
                    { path: '/roles/{id}', method: HTTP.Get, handler: this.roleController.getRoleById },
                    { path: '/roles', method: HTTP.Get, handler: this.roleController.getRoles }
                ]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/users/create', method: HTTP.Post, handler: this.userController.createUser },
                    { path: '/users/update/{id}', method: HTTP.Post, handler: this.userController.updateUserById },
                    { path: '/users/{id}/avatar/upload', method: HTTP.Post, handler: this.userController.uploadAvatar},
                    { path: '/users/{id}', method: HTTP.Get, handler: this.userController.getUserById },
                    { path: '/users', method: HTTP.Get, handler: this.userController.getUsers }
                ]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/faqs', method: HTTP.Get, handler: this.faqController.getFaqs },
                    { path: '/faqs', method: HTTP.Post, handler: this.faqController.createFaq },
                    { path: '/faqs/{id}', method: HTTP.Put, handler: this.faqController.updateFaq },
                    { path: '/faqs/{id}', method: HTTP.Delete, handler: this.faqController.removeFaq }
                ]
            }
        ];
    }
}
