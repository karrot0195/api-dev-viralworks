import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { Brand, IResetPassword } from 'Database/Schema/BrandSchema';

export interface IBrand {
    readonly name: string;
    readonly email: string;
    password: string;
    reset_password: IResetPassword;
    readonly phone: string;
    is_disabled?: boolean;
    tmp_avatar: string;
    bookmark_packages: string[];
}

@Injectable
export class BrandModel extends BaseModel<IBrand, Brand> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'brand');
    }

    findByEmail(email: string) {
        return this._model.findOne({ email });
    }
}
