import { Model, Document } from 'mongoose';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';

import { User, UserSchema } from './Schema/UserSchema';
import { PermisisonSchema } from 'System/RBAC/Schema/PermissionSchema';
import { RoleSchema } from 'System/RBAC/Schema/RoleSchema';
import { Faq, FaqSchema } from './Schema/FaqSchema';
import { KolUserSchema } from './Schema/KolUserSchema';
import { CategoryReasonSchema } from './Schema/CategoryReasonSchema';
import { MailSchema } from './Schema/MailSchema';

@Injectable
export class InitDatabase {
    constructor(mongo: Mongo) {
        mongo.define('user', { schema: UserSchema });
        mongo.define('permission', { schema: PermisisonSchema });
        mongo.define('role', { schema: RoleSchema })
        mongo.define('faq', { schema: FaqSchema });
        mongo.define('kol_user', { schema: KolUserSchema });
        mongo.define('category_reasons', { schema: CategoryReasonSchema });
        mongo.define('mail', { schema: MailSchema });
    }
}

export interface ModelDict {
    readonly user: Model<User>;
    readonly contact: Model<Faq>;
    readonly [collection: string]: Model<Document>;
}