import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { User } from 'Database/Schema/UserSchema';

export interface IUser {
    readonly name: string;
    readonly email: string;
    password: string;
    readonly role: string;
    code?: string;
    isDisabled?: boolean;
}

@Injectable
export class UserModel extends BaseModel<IUser, User> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'user');
    }

    findByEmail(email: string) {
        return this._model.findOne({ email });
    }
}