import * as Security from 'App/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { UserModel } from 'App/Models/UserModel';

@Injectable
export class AuthService {
    constructor(private readonly _config: Config, private readonly _mongo: Mongo, private readonly _userModel: UserModel) { }

    async login(email: string, password: string) {
        const user = await this._userModel.findByEmail(email).select('+password');

        if (user && Security.compare(this._config.security.pepper + password, user.password)) {
            return Security.signToken({ id: user.id, name: user.name, role: user.role }, this._config.jwt.key, this._config.jwt.expire);
        } else {
            return false;
        }
    }
}