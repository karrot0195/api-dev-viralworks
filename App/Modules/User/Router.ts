import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { AuthController } from './Controllers/AuthController';
import { UserController } from './Controllers/UserController';

import { AuthenticationMiddleware } from './Middlewares/AuthenticationMiddleware';
import { GuestMiddleware } from './Middlewares/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly authController: AuthController,
        readonly userController: UserController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                middleware: [{ class: this.guestMiddleware }],
                group: [{ path: '/auth', method: HTTP.Post, handler: this.authController.postLogin }]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }, { class: this.guestMiddleware }],
                group: [{ path: '/auth/check', method: HTTP.Get, handler: this.authController.getCheckToken }]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/users/', method: HTTP.Post, handler: this.userController.createUser },
                    { path: '/users/{id}/avatar', method: HTTP.Post, handler: this.userController.uploadAvatar },
                    { path: '/users/{id}/avatar', method: HTTP.Get, handler: this.userController.getAvatar },
                    { path: '/users/{id}', method: HTTP.Put, handler: this.userController.updateUserById },
                    { path: '/users/{id}', method: HTTP.Get, handler: this.userController.getUserById },
                    { path: '/users/{id}', method: HTTP.Delete, handler: this.userController.deleteUserById },
                    { path: '/users', method: HTTP.Get, handler: this.userController.getUsers }
                ]
            }
        ];
    }
}
