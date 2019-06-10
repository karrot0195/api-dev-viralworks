import { Model, Document } from 'mongoose';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';

import { User, UserSchema } from './Schema/UserSchema';
import { PermisisonSchema } from 'System/RBAC/Schema/PermissionSchema';
import { RoleSchema } from 'System/RBAC/Schema/RoleSchema';
import { Faq, FaqSchema } from './Schema/FaqSchema';
import { FuncKolUserCustomSchema, KolUserSchema, OptionKolUserSchema } from './Schema/KolUserSchema';
import { CategoryReasonSchema } from './Schema/CategoryReasonSchema';
import { MailSchema } from './Schema/MailSchema';
import { BrandSchema } from './Schema/BrandSchema';
import { JobSchema } from './Schema/JobSchema';
import { JobInviteSchema } from './Schema/JobInviteSchema';
import { HistorySchema } from './Schema/HistoryActionSchema';
import { KolJobSchema } from './Schema/KolJobSchema';
import { PackageSchema } from './Schema/PackageSchema';
import { LogSchema, LogSchemaOption } from './Schema/LogSchema';
import { CategoryJobSchema } from './Schema/CategoryJobsSchema';
import { CategoryShareStorySchema } from './Schema/CategoryShareStorysSchema';
import { CategoryBlogSchema } from './Schema/CategoryBlogSchema';
import { BlogSchema } from './Schema/BlogSchema';
import { SuggestKolPriceSchema } from './Schema/SuggestKolPriceSchema';
import { ProvinceSchema } from './Schema/ProvinceSchema';
import { BlacklistSchema } from './Schema/BlacklistSchema';
import { RequestPaymentSchema } from 'Database/Schema/RequestPaymentSchema';
import { NotificationSchema as AdminNotificationSchema } from 'Database/Schema/AdminNotificationSchema';
import { NotificationSchema as KolNotificationSchema} from 'Database/Schema/KolNotificationSchema';
import { BankSchema } from 'Database/Schema/BankSchema';
import { KolFacebookStatsHistorySchema } from './Schema/KolFacebookStatsHistorySchema';

@Injectable
export class InitDatabase {
    constructor(mongo: Mongo) {
        mongo.define('user', { schema: UserSchema });
        mongo.define('permission', { schema: PermisisonSchema });
        mongo.define('role', { schema: RoleSchema });
        mongo.define('faq', { schema: FaqSchema });
        mongo.define('kol_user', { schema: KolUserSchema, option: OptionKolUserSchema, customSchema: FuncKolUserCustomSchema });
        mongo.define('category_reason', { schema: CategoryReasonSchema });
        mongo.define('mail', { schema: MailSchema });
        mongo.define('brand', { schema: BrandSchema });
        mongo.define('job', { schema: JobSchema });
        mongo.define('job_invite', { schema: JobInviteSchema });
        mongo.define('history_action', { schema: HistorySchema });
        mongo.define('kol_job', { schema: KolJobSchema });
        mongo.define('kol_package', { schema: PackageSchema });
        mongo.define('log', { schema: LogSchema, option: LogSchemaOption });
        mongo.define('category_job', { schema: CategoryJobSchema });
        mongo.define('category_share_story', { schema: CategoryShareStorySchema });
        mongo.define('category_blog', { schema: CategoryBlogSchema });
        mongo.define('blog', { schema: BlogSchema });
        mongo.define('suggest_kol_price', { schema: SuggestKolPriceSchema });
        mongo.define('province', { schema: ProvinceSchema });
        mongo.define('blacklist', { schema: BlacklistSchema });
        mongo.define('request_payment', { schema: RequestPaymentSchema });
        mongo.define('admin_notification', { schema: AdminNotificationSchema });
        mongo.define('kol_notification', { schema: KolNotificationSchema });
        mongo.define('bank', { schema: BankSchema });
        mongo.define('kol_facebook_stats_history', { schema: KolFacebookStatsHistorySchema });
    }
}

export interface ModelDict {
    readonly user: Model<User>;
    readonly contact: Model<Faq>;
    readonly [collection: string]: Model<Document>;
}
