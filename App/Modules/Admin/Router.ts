import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';

import { AuthController } from './Controllers/AuthController';
import { RoleController } from './Controllers/RoleController';
import { UserController } from './Controllers/UserController';
import { FaqController } from './Controllers/FaqController';
import { CategoryReasonController } from './Controllers/CategoryReasonController';

import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { KolAuthController } from './Controllers/KolAuthController';
import { KolMailController } from './Controllers/KolMailController';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly roleController: RoleController,
        readonly authController: AuthController,
        readonly userController: UserController,
        readonly faqController: FaqController,
        readonly kolAuthController: KolAuthController,
        readonly categoryReasonController: CategoryReasonController,
        readonly kolMailController: KolMailController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware
    ) {
        this.routes = [
            { path: '/auth', method: HTTP.Post, handler: this.authController.postLogin },
            { path: '/hook-mail', method: HTTP.Post, handler: this.kolMailController.hookMail },
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
                    { path: '/roles/{id}', method: HTTP.Put, handler: this.roleController.updateRole },
                    { path: '/roles/{id}', method: HTTP.Delete, handler: this.roleController.deleteRoleById },
                    { path: '/roles/{id}/permission', method: HTTP.Put, handler: this.roleController.setEntries },
                    { path: '/roles', method: HTTP.Post, handler: this.roleController.createRole },
                    { path: '/roles', method: HTTP.Get, handler: this.roleController.getRoles },
                ],
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/users/create', method: HTTP.Post, handler: this.userController.createUser }
                ]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/faqs', method: HTTP.Get, handler: this.faqController.getFaqs },
                    { path: '/faqs', method: HTTP.Post, handler: this.faqController.createFaq },
                    { path: '/faqs/{id}', method: HTTP.Put, handler: this.faqController.updateFaq },
                    { path: '/faqs/{id}', method: HTTP.Delete, handler: this.faqController.removeFaq }
                ],
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/kol-users', method: HTTP.Get, handler: this.kolAuthController.getKolUsers },
                    { path: '/kol-users', method: HTTP.Post, handler: this.kolAuthController.createKolUser },
                    { path: '/kol-users/{id}', method: HTTP.Get, handler: this.kolAuthController.getKolUser },
                    {
                        path: '/kol-users/{id}/basic',
                        method: HTTP.Put,
                        handler: this.kolAuthController.updateKolInfoBase,
                    },
                    {
                        path: '/kol-users/{id}/facebook',
                        method: HTTP.Put,
                        handler: this.kolAuthController.updateKolInfoFacebook,
                    },
                    {
                        path: '/kol-users/option/evaluate',
                        method: HTTP.Get,
                        handler: this.kolAuthController.getOptionEvaluate,
                    },
                    {
                        path: '/kol-users/{id}/evaluate',
                        method: HTTP.Put,
                        handler: this.kolAuthController.updateKolInfoEvaluate,
                    },
                    {
                        path: '/kol-users/{id}/kol-status',
                        method: HTTP.Put,
                        handler: this.kolAuthController.updateKolInfoStatus,
                    },
                    {
                        path: '/kol-users/{id}/mail/{type}',
                        method: HTTP.Post,
                        handler: this.kolMailController.sendMail,
                    },
                ],
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/category-reasons', method: HTTP.Get, handler: this.categoryReasonController.getReasons },
                    { path: '/category-reasons', method: HTTP.Post, handler: this.categoryReasonController.createCategoryReason },
                    { path: '/category-reasons/{id}', method: HTTP.Get, handler: this.categoryReasonController.getReason },
                    { path: '/category-reasons/{id}', method: HTTP.Put, handler: this.categoryReasonController.updateCategoryReason },
                    { path: '/category-reasons/{id}/reasons', method: HTTP.Post, handler: this.categoryReasonController.createReason },
                    { path: '/category-reasons/{id}/reasons', method: HTTP.Put, handler: this.categoryReasonController.updateReason },
                ]
            },
        ];
    }
}
