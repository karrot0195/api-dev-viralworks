import { Injectable } from 'System/Injectable';
import { IRoute, IRouter, IRouteModule, IModuleRouter } from 'System/Interface';

import { Router as InfluencerRouter } from './Modules/Influencer/Router';
import { Router as BrandRouter } from './Modules/Brand/Router';
import { Router as AdminRouter } from './Modules/Admin/Router';

@Injectable
export class Router implements IModuleRouter {
    readonly routes: { [module: string]: IRouteModule };
    constructor(
        readonly adminRouter: AdminRouter,
        readonly influencerRouter: InfluencerRouter,
        readonly brandRouter: BrandRouter,
    ) {
        this.routes = {
            admin: { path: 'admin', group: this.adminRouter.routes, description: 'Admin Module document' },
            influencer: { path: 'influencer', group: this.influencerRouter.routes, description: 'Influencer Module document' },
            brand: { path: 'brand', group: this.brandRouter.routes, description: 'Brand Module document' }
        };
    }
}