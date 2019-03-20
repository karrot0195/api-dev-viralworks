import * as Security from 'App/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IUser, UserModel } from 'App/Models/UserModel';

@Injectable
export class UserService {
    constructor(private readonly _config: Config, private readonly _mongo: Mongo, private readonly _userModel: UserModel) { }

    create(data: IUser) {
        data.password = Security.hash(this._config.security.pepper + data.password);
        return this._userModel.create(data);
    }

    findById(id: string) {
        return this._userModel.findById(id);
    }
}