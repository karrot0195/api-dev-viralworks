import { Injectable } from 'System/Injectable';
import { IRouteModule, IModuleRouter } from 'System/Interface';

import { Router as BrandRouter } from './Modules/Brand/Router';
import { Router as AdminRouter } from './Modules/Admin/Router';
import { Router as PackageRouter } from './Modules/PublicPackage/Router';
import { Router as JobRoute } from './Modules/Job/Router';
import { Router as UserRoute } from './Modules/User/Router';
import { Router as RBACRoute } from './Modules/RBAC/Router';
import { Router as MetaRoute } from './Modules/Metadata/Router';
import { Router as JobRouter } from './Modules/Job/Router';
import { Router as SocialRouter } from './Modules/Social/Router';
import { Router as KolRouter } from './Modules/Kol/Router';
import { Router as AttachmentRouter } from './Modules/Attachment/Router';
import { Router as RequestPaymentRouter } from './Modules/PaymentRequest/Router';
import { Router as CronRouter } from './Modules/Cron/Router';

@Injectable
export class Router implements IModuleRouter {
    readonly routes: { [module: string]: IRouteModule };
    constructor(
        readonly adminRouter: AdminRouter,
        readonly brandRouter: BrandRouter,
        readonly packageRouter: PackageRouter,
        readonly jobRoute: JobRoute,
        readonly userRoute: UserRoute,
        readonly rbacRoute: RBACRoute,
        readonly metaRoute: MetaRoute,
        readonly jobRouter: JobRouter,
        readonly socialRouter: SocialRouter,
        readonly kolRouter: KolRouter,
        readonly attachmentRouter: AttachmentRouter,
        readonly requestPaymentRouter: RequestPaymentRouter,
        readonly cronRouter: CronRouter
    ) {
        this.routes = {
            admin: { path: 'admin', group: this.adminRouter.routes, description: 'Admin Service document' },
            brand: { path: 'brand', group: this.brandRouter.routes, description: 'Brand Service document' },
            job: { path: 'job', group: this.jobRoute.routes, description: 'Job Service document' },
            package: {
                path: 'package',
                group: this.packageRouter.routes,
                description: 'Public Package Service document'
            },
            user: { path: 'user', group: this.userRoute.routes, description: 'User Service document' },
            rbac: {
                path: 'rbac',
                group: this.rbacRoute.routes,
                description: 'Role Base Access Control Service document'
            },
            metadata: {
                path: 'metadata',
                group: this.metaRoute.routes,
                description: 'Metadata Service document'
            },
            social: {
                path: 'social',
                group: this.socialRouter.routes,
                description: 'Social Module document'
            },
            kol: {
                path: 'kol',
                group: this.kolRouter.routes,
                description: 'Kol Module document'
            },
            attachment: {
                path: 'attachment',
                group: this.attachmentRouter.routes,
                description: 'Attachment Module document'
            },
            requestpayment: {
                path: 'request-payment',
                group: this.requestPaymentRouter.routes,
                description: 'Request payment module document'
            },
            cron: {
                path: 'cron',
                group: this.cronRouter.routes,
                description: 'System cron management document'
            }
        };
    }
}
