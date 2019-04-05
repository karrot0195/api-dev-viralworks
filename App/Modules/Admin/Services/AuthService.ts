import * as Security from 'System/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { UserModel } from 'App/Models/UserModel';
import { BadRequest } from 'System/Error';

@Injectable
export class AuthService {
    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _userModel: UserModel
    ) {}

    async login(email: string, password: string, remember: number = 0) {
        const user = await this._userModel.findByEmail(email).select('+password');

        if (user && Security.compare(this._config.security.pepper + password, user.password)) {
            let expire: string = this._config.jwt.expire;
            if (remember == 1) expire = this._config.jwt.remember;

            // make jwt token
            let token = Security.signToken(
                { id: user.id, name: user.name, role: user.role },
                this._config.jwt.key,
                expire
            );

            let userInfo = {
                id: user.id,
                name: user.name,
                code: user.code,
                role: user.role,
                email: user.email,
                entries: ['feature/is/not/available'],
                created_at: user.created_at,
            };

            return { info: userInfo, token: token };
        } else {
            return false;
        }
    }

    async getUserInfo(token: string = '') {
        let data = Security.decodeToken(token) || {};

        const user = await this._userModel.findById(data['id']);

        if (user) {
            return {
                id: user.id,
                name: user.name,
                code: user.code,
                role: user.role,
                email: user.email,
                entries: ['feature/is/not/available'],
                created_at: user.created_at,
            };
        } else {
            throw new BadRequest('User is no longer valid');
        }
    }
}
