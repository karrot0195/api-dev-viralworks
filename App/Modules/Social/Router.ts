import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from "System/Enum/HTTP";
import { SocialController } from './Controllers/SocialController';
import { GuestMiddleware } from 'App/Modules/Social/Middleware/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly socialController: SocialController,

        readonly guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                middleware: [ { class: this.guestMiddleware} ],
                path: '/socials',
                group: [
                    {
                        path: '/facebook',
                        group: [
                            { path: 'authenticate', handler: this.socialController.authenticateFacebook, method: HTTP.Post },
                            { path: 'callback', handler: this.socialController.facebookCallback, method: HTTP.Get }
                        ]
                    }
                ]
            }
        ];
    }
}
