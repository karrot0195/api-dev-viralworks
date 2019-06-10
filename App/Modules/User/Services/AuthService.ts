import * as Security from 'System/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { UserModel } from 'App/Models/UserModel';
import { BadRequest, Forbidden, NotFound } from 'System/Error';
import { RoleBasedAccessControl } from 'System/RBAC';

@Injectable
export class AuthService {
    constructor(
        private readonly _config: Config,
        private readonly _userModel: UserModel,
        private readonly _service: RoleBasedAccessControl
    ) {}

    async login(email: string, password: string, remember: number = 0, avatarUrlInfo?: any) {
        let user = await this._userModel.findByEmail(email).select('+password');

        if (!user) throw new NotFound('USER_NOT_FOUND');

        if (user && user.is_disabled) throw new Forbidden('USER_IS_DISABLED');

        if (user && Security.compare(this._config.security.pepper + password, user.password)) {
            let expire: string = this._config.jwt.expire;
            if (remember == 1) expire = this._config.jwt.remember;

            // make jwt token
            let token = Security.signToken(
                { id: user.id, name: user.name, roles: user.roles },
                this._config.jwt.key,
                expire
            );

            user.password = '';

            let permissions = await this._service.getRouteListByRoles(user.roles);

            if (avatarUrlInfo) {
                user.avatar_url = avatarUrlInfo.baseUrl + user.id + avatarUrlInfo.path;
            }

            await user.populate({ path: 'roles', select: 'name' }).execPopulate();

            return { info: user, permissions: permissions, token: token };
        } else {
            throw new BadRequest({ fields: { password: 'WRONG_PASSWORD' } });
        }
    }

    async getUserInfo(id: string, avatarUrlInfo?: any) {
        const user = await this._userModel.findById(id);

        if (user) {
            user.password = '';

            let permissions = await this._service.getRouteListByRoles(user.roles);

            if (avatarUrlInfo) {
                user.avatar_url = avatarUrlInfo.baseUrl + user.id + avatarUrlInfo.path;
            }

            await user.populate({ path: 'roles', select: 'name' }).execPopulate();

            return { info: user, permissions: permissions };
        } else {
            throw new NotFound('USER_NOT_FOUND');
        }
    }
}
