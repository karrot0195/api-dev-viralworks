import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { BrandAuthController } from './Controllers/BrandAuthController';
import { GuestMiddleware } from './Middleware/GuestMiddleware';
import { BrandController } from './Controllers/BrandController';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly authController: BrandAuthController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware,
        readonly brandController: BrandController
    ) {
        this.routes = [
            {
                middleware: [{ class: this.guestMiddleware }],
                group: [
                    { path: '/auth', method: HTTP.Post, handler: this.authController.postLogin },
                    { path: '/forgot-password', method: HTTP.Post, handler: this.authController.requestResetPassword },
                    {
                        path: '/forgot-password',
                        method: HTTP.Get,
                        handler: this.authController.getResetPasswordTokenInfo
                    },
                    {
                        path: '/reset-password',
                        method: HTTP.Post,
                        handler: this.authController.resetPassword
                    }
                ]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }, { class: this.guestMiddleware }],
                group: [{ path: '/auth/check', method: HTTP.Get, handler: this.authController.getCheckToken }]
            },
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    {
                        path: '/brands/bookmark-groups',
                        method: HTTP.Post,
                        handler: this.brandController.bookmarkPackage
                    },
                    {
                        path: '/brands/bookmark-groups',
                        method: HTTP.Put,
                        handler: this.brandController.removeBookmarkPackage
                    },
                    {
                        path: '/brands/bookmark-groups',
                        method: HTTP.Get,
                        handler: this.brandController.findBookmarkPackage
                    },
                    {
                        path: '/brands/sidebar-stats',
                        method: HTTP.Get,
                        handler: this.brandController.getSidebarStats
                    },
                    {
                        path: '/brands/influencer-groups',
                        method: HTTP.Get,
                        handler: this.brandController.getDashboardPackages
                    },
                    {
                        path: '/brands/instant-groups',
                        method: HTTP.Get,
                        handler: this.brandController.getInstantPackages
                    },
                    {
                        path: '/brands/influencer-groups/{id}',
                        method: HTTP.Get,
                        handler: this.brandController.getDashboardPackageById
                    },

                    {
                        path: '/brands/ongoing-jobs',
                        method: HTTP.Get,
                        handler: this.brandController.getOngoingJobs
                    },

                    {
                        path: '/brands/completed-jobs',
                        method: HTTP.Get,
                        handler: this.brandController.getCompletedJobs
                    },

                    {
                        path: '/brands/jobs/{id}',
                        method: HTTP.Get,
                        handler: this.brandController.getJobById
                    },

                    { path: '/brands', method: HTTP.Get, handler: this.brandController.getBrands },
                    { path: '/brands/{id}', method: HTTP.Get, handler: this.brandController.getBrandById },
                    { path: '/brands/{id}', method: HTTP.Put, handler: this.brandController.updateBrandById },
                    { path: '/brands', method: HTTP.Post, handler: this.brandController.createBrand },
                    { path: '/brands/temp-avatar', method: HTTP.Post, handler: this.brandController.uploadTempAvatar },
                    { path: '/brands/{id}/avatar', method: HTTP.Post, handler: this.brandController.uploadAvatar },
                    { path: '/brands/{id}/avatar', method: HTTP.Get, handler: this.brandController.getAvatar }
                ]
            }
        ];
    }
}
