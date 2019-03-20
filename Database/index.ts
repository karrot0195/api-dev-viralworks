import { Model, Document } from 'mongoose';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';

import { User, UserSchema } from './Schema/UserSchema';

@Injectable
export class InitDatabase {
    constructor(mongo: Mongo) {
        mongo.define('user', { schema: UserSchema });
    }
}

export interface ModelDict {
    readonly user: Model<User>;
    readonly [collection: string]: Model<Document>;
}