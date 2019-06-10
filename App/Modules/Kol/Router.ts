import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum/HTTP';
import { KolManagerController } from 'App/Modules/Kol/Controllers/Admin/KolManagerController';
import { KolMailController } from 'App/Modules/Admin/Controllers/KolMailController';
import { KolController } from 'App/Modules/Kol/Controllers/Kol/KolController';
import { AuthenticationController } from 'App/Modules/Kol/Controllers/AuthenticationController';
import { KolAuthenticationMiddleware } from 'App/Modules/Kol/Middleware/KolAuthenticationMiddleware';
import { AuthenticationMiddleware } from 'App/Modules/Admin/Middleware/AuthenticationMiddleware';
import { KolInviteController } from 'App/Modules/Kol/Controllers/Kol/KolInviteController';
import { PostPushController } from 'App/Modules/Kol/Controllers/Kol/PostPushController';
import { GuestMiddleware } from 'App/Modules/Kol/Middleware/GuestMiddleware';
import { KolJobController } from 'App/Modules/Kol/Controllers/Kol/KolJobController';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly kolAuthController: KolManagerController,
        readonly kolMailController: KolMailController,

        readonly kolController: KolController,
        readonly authController: AuthenticationController,
        readonly kolInviteController: KolInviteController,
        readonly postPushController: PostPushController,
        readonly kolJobController: KolJobController,
        // middleware
        readonly kolAuthMiddleware: KolAuthenticationMiddleware,
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                path: '',
                middleware: [ { class: this.guestMiddleware } ],
                group: [
                    { path: 'register/social', handler: this.authController.actionRegisterKol, method: HTTP.Post },
                    {
                        path: 'login',
                        method: HTTP.Post,
                        handler: this.authController.actionPostLogin
                    },
                    {
                        path: 'forgot-password',
                        method: HTTP.Put,
                        handler: this.authController.actionForgotPassword
                    },
                    {
                        path: 'recovery-password',
                        method: HTTP.Put,
                        handler: this.authController.actionRecoveryPassword
                    },
                    {
                        path: 'job-attachments/{job_id}/{attachment_name}',
                        method: HTTP.Get,
                        handler: this.kolInviteController.actionRenderAttachment
                    },
                    {
                        path: '/send-mail-verify',
                        method: HTTP.Post,
                        handler: this.authController.actionSendMailVerify
                    },
                    {
                        path: '/mail-verify',
                        method: HTTP.Post,
                        handler: this.authController.actionVerifyEmail
                    },
                    {
                        path: 'kol/post/{job_id}/attachment/{file_name}',
                        method: HTTP.Get,
                        handler: this.postPushController.actionViewAttachment
                    },
                ]
            },
            // Kol KolAuth
            this._adminRouter(),
            // Kol Dashboard
            this._kolRouter()
        ];
    }

    private _adminRouter() {
        return {
            middleware: [{ class: this.authenticationMiddleware }],
            path: 'auth/kol-users',
            group: [
                // ADMIN
                { path: '', method: HTTP.Get, handler: this.kolAuthController.actionGetKolUsers },
                { path: '', method: HTTP.Post, handler: this.kolAuthController.actionCreateKolUser },
                { path: '{id}', method: HTTP.Get, handler: this.kolAuthController.actionGetKolUser },
                { path: '{id}', method: HTTP.Delete, handler: this.kolAuthController.actionRemoveKolUser },
                { path: '{id}/histories', method: HTTP.Get, handler: this.kolAuthController.getHistoryAction },
                { path: '{id}/status/{state}', method: HTTP.Put, handler: this.kolAuthController.actionUpdateState },
                {
                    path: '{id}/engagement',
                    method: HTTP.Put,
                    handler: this.kolAuthController.actionUpdateEngagement
                },
                {
                    path: '{id}/basic',
                    method: HTTP.Put,
                    handler: this.kolAuthController.actionUpdateKolInfoBase
                },
                {
                    path: '{id}/facebook',
                    method: HTTP.Put,
                    handler: this.kolAuthController.actionUpdateKolInfoFacebook
                },
                {
                    path: 'option/evaluate',
                    method: HTTP.Get,
                    handler: this.kolAuthController.actionGetOptionEvaluate
                },
                {
                    path: '{id}/evaluate',
                    method: HTTP.Put,
                    handler: this.kolAuthController.actionUpdateKolInfoEvaluate
                },
                {
                    path: '{id}/kol-status/{status}',
                    method: HTTP.Put,
                    handler: this.kolAuthController.actionUpdateKolInfoStatus
                },
                {
                    path: '{id}/mail/{type}',
                    method: HTTP.Put,
                    handler: this.kolMailController.actionSendMail
                },
                {
                    path: '{id}/mail',
                    method: HTTP.Get,
                    handler: this.kolAuthController.actionGetKolMails
                }
            ]
        };
    }

    private _kolRouter() {
        return {
            middleware: [{ class: this.kolAuthMiddleware }],
            path: 'kol',
            group: [
                {
                    path: '',
                    method: HTTP.Get,
                    handler: this.authController.actionGetInfo
                },
                {
                    path: 'password',
                    method: HTTP.Put,
                    handler: this.authController.actionChangePassword
                },
                {
                    path: '/basic',
                    method: HTTP.Put,
                    handler: this.kolController.actionUpdateInfo
                },
                {
                    path: '/auth',
                    method: HTTP.Post,
                    handler: this.authController.actionCheckAuth
                },
                {
                    path: 'payment',
                    method: HTTP.Put,
                    handler: this.kolController.actionUpdatePayment
                },
                {
                    path: 'jobs',
                    method: HTTP.Put,
                    handler: this.kolController.actionUpdateJob
                },
                {
                    path: 'share-stories',
                    method: HTTP.Put,
                    handler: this.kolController.actionUpdateShareStory
                },
                {
                    path: 'price',
                    method: HTTP.Put,
                    handler: this.kolController.actionUploadPrice
                },
                {
                    path: 'invites',
                    method: HTTP.Get,
                    handler: this.kolInviteController.actionGetInviteList
                },
                {
                    path: 'invites/{id}',
                    method: HTTP.Get,
                    handler: this.kolInviteController.actionGetInvite
                },
                {
                    path: 'invites/{id}/join',
                    method: HTTP.Put,
                    handler: this.kolInviteController.actionJoinJob
                },
                {
                    path: 'invites/{invite_id}/reject',
                    method: HTTP.Put,
                    handler: this.kolInviteController.actionRejectInvite
                },
                {
                  path: 'jobs',
                  group: [
                      {
                          path: '/running',
                          method: HTTP.Get,
                          handler: this.kolJobController.actionGetJobRunning
                      },
                      {
                          path: '/completed',
                          method: HTTP.Get,
                          handler: this.kolJobController.actionGetJobCompleted
                      },
                      {
                          path: '{id}',
                          method: HTTP.Get,
                          handler: this.kolJobController.actionGetInvite
                      }
                  ]
                },
                {
                    path: 'post',
                    group: [
                        // publish post
                        {
                            path: '{job_id}/content',
                            method: HTTP.Put,
                            handler: this.postPushController.actionPublishContent
                        },
                        {
                            path: '{job_id}/link',
                            method: HTTP.Put,
                            handler: this.postPushController.actionPublishLink
                        }
                    ]
                }
            ]
        };
    }
}
