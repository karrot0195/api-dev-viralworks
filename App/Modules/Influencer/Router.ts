import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { TestController } from './Controllers/TestController';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly testController: TestController,

        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware
    ) {
        this.routes = [
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/test/{id}', method: HTTP.Post, handler: this.testController.postTest }
                ]
            }
        ];
    }
}