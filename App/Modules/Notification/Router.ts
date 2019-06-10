import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { KolAuthenticationMiddleware } from 'App/Modules/Notification/Middleware/KolAuthenticationMiddleware';
import { AdminAuthenticationMiddleware } from 'App/Modules/Notification/Middleware/AdminAuthenticationMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        private kolAuthenticationMiddleware: KolAuthenticationMiddleware,
        private adminAuthenticationMiddleware: AdminAuthenticationMiddleware
    ) {
        this.routes = [
            {
                path: 'admin',
                middleware: [ {class: this.adminAuthenticationMiddleware} ],
                group: [

                ]
            },
            {
                path: 'kol',
                middleware: [ {class: this.kolAuthenticationMiddleware} ],
                group: [

                ]
            },
        ];
    }
}
