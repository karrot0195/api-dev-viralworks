import * as Security from 'System/Helpers/Security';
import * as _ from 'lodash';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { IUser, UserModel } from 'App/Models/UserModel';
import { generateUserCode } from 'App/Helpers/Generator';
import { RoleBasedAccessControlService } from 'System/RBAC/Service';
import { BadRequest, NotFound } from 'System/Error';
import { UserSearchField } from 'Database/Schema/UserSchema';
import { FileStorage } from 'System/FileStorage';
import { ImageMIME } from 'System/Enum/MIME';
import { DefaultImage } from 'App/Constants/DefaultImage';
import { Mongo } from 'System/Mongo';
import { RoleBasedAccessControl } from 'System/RBAC';
import { BlacklistReason } from 'System/Enum/BlacklistReason';

@Injectable
export class UserService {
    readonly defaultUserPopulation = { path: 'roles', select: 'name' };

    constructor(
        private readonly _config: Config,
        private readonly _userModel: UserModel,
        private readonly _RBACService: RoleBasedAccessControlService,
        private readonly _RBACController: RoleBasedAccessControl,
        private readonly _storage: FileStorage,
        private readonly _mongo: Mongo
    ) {}

    async create(data: IUser, avatarUrlInfo?: any) {
        data.password = Security.hash(this._config.security.pepper + data.password);

        let codeExisted: any = false;

        while (!codeExisted) {
            data.code = generateUserCode('SU', 5);
            codeExisted = await this.find({ code: data.code });
        }

        if (data.roles && !_.includes(data.roles, 'admin')) {
            let count = (await this._RBACService.findRoleByIds(data.roles)).length;

            if (data.roles.length !== count) throw new BadRequest({ fields: { roles: 'ROLES_NOT_FOUND' } });
        }

        data.is_disabled = false;

        let result = await this._userModel.create(data);
        result.password = '';

        if (avatarUrlInfo) {
            result.avatar_url = avatarUrlInfo.baseUrl + result.id + avatarUrlInfo.path;
        }

        return result.populate(this.defaultUserPopulation).execPopulate();
    }

    async updateUserById(id: string, userData: IUser, avatarUrlInfo?: any) {
        let user = await this.findById(id);

        if (!user) throw new NotFound('USER_NOT_FOUND');

        let isUpdateDisable: boolean = userData.is_disabled !== undefined && user.is_disabled !== userData.is_disabled;

        let tmp = await this._mongo.transaction(async session => {
            if (userData.name) user.name = userData.name;
            if (userData.email) user.email = userData.email;

            if (userData.password) {
                user.password = Security.hash(this._config.security.pepper + userData.password);

                await this._RBACService.disableToken(id, BlacklistReason.CHANGE_PASSWORD, session);
            }

            if (userData.roles !== undefined) {
                let count = (await this._RBACService.findRoleByIds(userData.roles)).length;

                if (userData.roles.length !== count) throw new BadRequest({ fields: { roles: 'ROLES_NOT_FOUND' } });

                user.roles = userData.roles;

                await this._RBACService.disableToken(id, BlacklistReason.CHANGE_ROLE, session);
            }

            if (isUpdateDisable) {
                if (userData.is_disabled) await this._RBACService.disableUser(id, 'admin', session);

                if (!userData.is_disabled) await this._RBACService.enableUser(id, 'admin', session);

                user.is_disabled = userData.is_disabled || false;
            }

            await user.save({ session });

            return user.populate(this.defaultUserPopulation).execPopulate();
        });

        if (isUpdateDisable || userData.password || userData.roles !== undefined)
            await this._RBACController.loadBlacklist();

        tmp.password = '';

        if (avatarUrlInfo) {
            tmp.avatar_url = avatarUrlInfo.baseUrl + tmp.id + avatarUrlInfo.path;
        }

        return tmp;
    }

    async find(condition?: any) {
        return this._userModel.find(condition);
    }

    async findById(id: string, fields?: string, avatarUrlInfo?: any) {
        const user = await this._userModel.findById(id, fields);

        if (!user) throw new NotFound('USER_NOT_FOUND');

        if (avatarUrlInfo) {
            user.avatar_url = avatarUrlInfo.baseUrl + id + avatarUrlInfo.path;
        }

        return user.populate(this.defaultUserPopulation).execPopulate();
    }

    async findUserWithFilter(conditions?: any, avatarUrlInfo?: any) {
        let tmp = await this._userModel.findWithFilter(
            conditions,
            UserSearchField,
            undefined,
            this.defaultUserPopulation
        );

        if (avatarUrlInfo) {
            tmp.results.forEach(user => {
                user.avatar_url = avatarUrlInfo.baseUrl + user.id + avatarUrlInfo.path;
            });
        }

        return tmp;
    }

    async uploadAvatar(id: string, avatar: any) {
        let user = await this.findById(id);

        if (!user) throw new NotFound('USER_NOT_FOUND');

        if (await this._storage.checkUploadFileType(avatar.path, ImageMIME)) {
            return await this._storage.storeUploadFile(avatar.path, 'avatar', id);
        }

        throw new BadRequest({ fields: { avatar: 'IMAGE_WRONG_TYPE' } });
    }

    async getAvatarAbsolutePath(id: string) {
        let user = await this.findById(id);

        if (!user) throw new NotFound('USER_NOT_FOUND');

        return (
            (await this._storage.getAbsoluteFilePath('avatar', id)) ||
            (await this._storage.getAbsoluteFilePath('avatar', DefaultImage.USER_AVATAR_IMAGE))
        );
    }

    async deleteById(id: string) {
        const user = await this._userModel.findById(id);

        if (!user) throw new NotFound('USER_NOT_FOUND');

        return user.remove();
    }
}
