import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { CronController } from './Controllers/Cron';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(readonly authenticationMiddleware: AuthenticationMiddleware, readonly cronController: CronController) {
        this.routes = [
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    {
                        path: '/crons',
                        method: HTTP.Get,
                        handler: this.cronController.getCrons
                    },
                    {
                        path: '/crons/{slug}',
                        method: HTTP.Get,
                        handler: this.cronController.updateCrons
                    }
                ]
            }
        ];
    }
}
