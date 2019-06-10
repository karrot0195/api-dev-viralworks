import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';
import { JobController } from './Controllers/JobController';
import { JobInviteController } from './Controllers/JobInviteController';
import { KolJobController } from './Controllers/KolJobController';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly jobController: JobController,
        readonly jobInviteController: JobInviteController,
        readonly kolJobController: KolJobController,
        readonly authenticationMiddleware: AuthenticationMiddleware
    ) {
        this.routes = [
            this.jobRouter(),
            this.kolJobRouter()
        ];
    }

    // PRIVATE FUNCTION
    private jobRouter() {
        return {
            middleware: [{ class: this.authenticationMiddleware }],
            path: '/jobs',
            group: [
                /* manager job */
                {
                    middleware: [{ class: this.authenticationMiddleware }],
                    group: [
                        { path: '', method: HTTP.Get, handler: this.jobController.getJobs },
                        { path: '', method: HTTP.Post, handler: this.jobController.createJob },
                        { path: 'post-link', method: HTTP.Put, handler: this.jobController.actionUpdatePostLink },
                        { path: 'generate', method: HTTP.Put, handler: this.jobController.actionGenerateJob},
                        { path: 'finish', method: HTTP.Put, handler: this.jobController.actionAuthFinish},
                        { path: '{id}', method: HTTP.Get, handler: this.jobController.getJob },
                        { path: '{id}', method: HTTP.Put, handler: this.jobController.updateJob },
                        // group
                        { path: '{id}/groups', method: HTTP.Post, handler: this.jobController.addGroup },
                        {
                            path: '{id}/groups/{tag}',
                            method: HTTP.Put,
                            handler: this.jobController.updateGroup
                        },
                        {
                            path: '{id}/groups/{tag}',
                            method: HTTP.Delete,
                            handler: this.jobController.removeGroup
                        },
                        { path: '{id}/close', method: HTTP.Put, handler: this.jobController.actionCloseJob },
                        { path: '{id}/engagement', method: HTTP.Put, handler: this.jobController.actionUpdateEngagement },
                        // kol
                        { path: '{id}/kols', method: HTTP.Post, handler: this.jobController.addKols },
                        { path: '{id}/kols', method: HTTP.Get, handler: this.jobController.getKols },
                        { path: '{id}/kols', method: HTTP.Delete, handler: this.jobController.removeKols },
                        // attachment
                        {
                            path: '{id}/attachment/{name}',
                            method: HTTP.Get,
                            handler: this.jobController.getAttachment
                        },
                        { path: '{id}', method: HTTP.Delete, handler: this.jobController.removeJob },
                        // invite
                        {
                            path: 'invites/{invite_id}',
                            method: HTTP.Get,
                            handler: this.jobInviteController.actionInviteDetail
                        },
                        {
                            path: '{id}/invites',
                            method: HTTP.Put,
                            handler: this.jobInviteController.actionInviteKol
                        },
                        {
                            path: 'invites/{invite_id}/reject',
                            method: HTTP.Put,
                            handler: this.jobInviteController.actionRejectInvite
                        },
                        {
                            path: 'invites/{invite_id}/re-invite',
                            method: HTTP.Put,
                            handler: this.jobInviteController.actionReinvteKol
                        }
                    ]
                },
                /**/
            ]
        };
    }

    private kolJobRouter() {
        return {
            middleware: [{ class: this.authenticationMiddleware }],
            path: 'kol-jobs',
            group: [
                {
                    path: '',
                    method: HTTP.Post,
                    handler: this.kolJobController.createKolJobByInvite
                },
                { path: '', method: HTTP.Get, handler: this.kolJobController.getKolJobs },

                { path: '{id}', method: HTTP.Get, handler: this.kolJobController.getKolJob },
                {
                    path: '{id}',
                    method: HTTP.Delete,
                    handler: this.kolJobController.removeKolJob
                },
                {
                    path: '{id}/post',
                    method: HTTP.Put,
                    handler: this.kolJobController.updatePostData
                },

                {
                    path: '{id}/notes',
                    method: HTTP.Post,
                    handler: this.kolJobController.actionPushNote
                },
                {
                    path: '{id}/state/{action}',
                    method: HTTP.Put,
                    handler: this.kolJobController.actionBlockJob
                },
                {
                    path: '{id}/post-time/{post_time}',
                    method: HTTP.Put,
                    handler: this.kolJobController.actionChangePostTime
                },
                {
                    path: '{id}/post/{action}',
                    method: HTTP.Put,
                    handler: this.kolJobController.updateStatePostData
                },
                { path: '{id}/close', method: HTTP.Put, handler: this.kolJobController.closeJob },
                {
                    path: '{id}/payment/{action}',
                    method: HTTP.Put,
                    handler: this.kolJobController.updateStatePayment
                }
            ]
        };
    }
}
