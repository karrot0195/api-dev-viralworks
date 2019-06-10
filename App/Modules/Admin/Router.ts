import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { FaqController } from './Controllers/FaqController';
import { CategoryReasonController } from './Controllers/CategoryReasonController';

import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { KolMailController } from './Controllers/KolMailController';
import { GuestMiddleware } from './Middleware/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly faqController: FaqController,
        readonly categoryReasonController: CategoryReasonController,
        readonly kolMailController: KolMailController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                path: '/hook-mail',
                method: HTTP.Post,
                handler: this.kolMailController.hookMail,
                middleware: [
                    {
                        class: this.guestMiddleware
                    }
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
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/category-reasons', method: HTTP.Get, handler: this.categoryReasonController.getReasons },
                    {
                        path: '/category-reasons',
                        method: HTTP.Post,
                        handler: this.categoryReasonController.createCategoryReason
                    },
                    {
                        path: '/category-reasons/{id}',
                        method: HTTP.Get,
                        handler: this.categoryReasonController.getReason
                    },
                    {
                        path: '/category-reasons/{id}',
                        method: HTTP.Delete,
                        handler: this.categoryReasonController.deleteCategoryReason
                    },
                    {
                        path: '/category-reasons/{id}',
                        method: HTTP.Put,
                        handler: this.categoryReasonController.updateCategoryReason
                    },
                    {
                        path: '/category-reasons/{id}/reasons',
                        method: HTTP.Post,
                        handler: this.categoryReasonController.createReason
                    },
                    {
                        path: '/category-reasons/{id}/reasons',
                        method: HTTP.Put,
                        handler: this.categoryReasonController.updateReason
                    },
                    {
                        path: '/category-reasons/{id}/reasons/{reason_id}',
                        method: HTTP.Delete,
                        handler: this.categoryReasonController.deleteReason
                    }
                ]
            }
        ];
    }
}
