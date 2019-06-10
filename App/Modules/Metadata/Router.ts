import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';
import { AuthenticationMiddleware } from './Middlewares/AuthenticationMiddleware';
import { MetadataController } from '../Metadata/Controllers/MetadataController';
import { GuestMiddleware } from 'App/Modules/Metadata/Middlewares/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly metadataController: MetadataController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware,
    ) {
        this.routes = [
            {
                middleware: [{ class: this.authenticationMiddleware }, { class: this.guestMiddleware }],
                group: [
                    { path: '/occupations', method: HTTP.Get, handler: this.metadataController.getCategoryJobs },
                    { path: '/topics', method: HTTP.Get, handler: this.metadataController.getShareStories },
                    { path: '/tag-colors', method: HTTP.Get, handler: this.metadataController.getTagColors },
                    { path: '/provinces', method: HTTP.Get, handler: this.metadataController.actionGetProvinces },
                    { path: '/suggest-prices', method: HTTP.Get, handler: this.metadataController.actionSuggestPrices },
                    { path: '/faq/kol', method: HTTP.Get, handler: this.metadataController.actionGetKolFaqs },
                    { path: '/banks', method: HTTP.Get, handler: this.metadataController.actionGetBanks }
                ]
            }
        ];
    }
}
