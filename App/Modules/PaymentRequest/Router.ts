import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum/HTTP';
import { AuthenticationMiddleware } from 'App/Modules/PaymentRequest/Middlewares/AuthenticationMiddleware';
import { KolAuthenticationMiddleware } from 'App/Modules/PaymentRequest/Middlewares/KolAuthenticationMiddleware';
import { RequestPaymentController as AdminRequestPaymentController } from 'App/Modules/PaymentRequest/Controllers/Admin/RequestPaymentController';
import { RequestPaymentController as KolRequestPaymentController } from 'App/Modules/PaymentRequest/Controllers/Kol/RequestPaymentController';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly adminPaymentController: AdminRequestPaymentController,
        readonly kolRequestPaymentController: KolRequestPaymentController,
        // middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly kolAuthenticationMiddleware: KolAuthenticationMiddleware
    ) {
        this.routes = [
            {
                path: 'admin',
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    {
                        path: 'request-payments',
                        group: [
                            {
                                path: '',
                                method: HTTP.Get,
                                handler: this.adminPaymentController.actionGetList
                            },
                            {
                                path: '{id}/{action}',
                                method: HTTP.Put,
                                handler: this.adminPaymentController.actionProcessRequest
                            }
                        ]
                    }

                ]
            },
            {
                path: 'kol',
                middleware: [{ class: this.kolAuthenticationMiddleware }],
                group: [
                    {
                        path: 'request-payments',
                        method: HTTP.Get,
                        handler: this.kolRequestPaymentController.actionGetListRequest
                    },
                    {
                        path: 'request-payments',
                        method: HTTP.Post,
                        handler: this.kolRequestPaymentController.actionCreatePaymentRequest
                    },
                    {
                        path: 'request-payments/check',
                        method: HTTP.Get,
                        handler: this.kolRequestPaymentController.actionCheckCreateRequest
                    },

                ]
            }
        ];
    }
}
