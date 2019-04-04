import * as Security from 'System/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { IUser, UserModel } from 'App/Models/UserModel';
import { generateUserCode } from 'App/Helpers/Generator';
import { RoleBasedAccessControlService } from 'System/RBAC/Service';
import { BadRequest } from 'System/Error';
import { UserSearchField } from 'Database/Schema/UserSchema';
import { FileStorage } from 'System/FileStorage';
import { ImageMIME } from 'System/Enum/MIME';
import { UserError } from '../Enum/Error';

@Injectable
export class UserService {
    constructor(
        private readonly _config: Config,
        private readonly _userModel: UserModel,
        private readonly _RBACService: RoleBasedAccessControlService,
        private readonly _storage: FileStorage
    ) {}

    async create(data: IUser) {
        data.password = Security.hash(this._config.security.pepper + data.password);

        let codeExisted: any = false;

        while (!codeExisted) {
            data.code = generateUserCode('SU', 5);
            codeExisted = await this.find({ code: data.code });
        }

        if (data.role && data.role !== 'admin') {
            if (!(await this._RBACService.findRoleById(data.role))) throw new BadRequest(UserError.ROLE_NOT_FOUND);
        }

        data.isDisabled = false;

        let result = await this._userModel.create(data);
        result.password = '';

        return result;
    }

    async updateUserById(id: string, userData: IUser) {
        let user = await this.findById(id);

        if (!user) throw new BadRequest(UserError.USER_NOT_FOUND);

        if (userData.name) user.name = userData.name;
        if (userData.email) user.email = userData.email;
        if (userData.password) user.password = Security.hash(this._config.security.pepper + userData.password);
        if (typeof userData.isDisabled !== 'undefined') user.isDisabled = userData.isDisabled;

        if (userData.role) {
            if (!(await this._RBACService.findRoleById(userData.role))) {
                throw new BadRequest(UserError.ROLE_NOT_FOUND);
            }
            user.role = userData.role;
        }

        let tmp = await user.save();
        tmp.password = '';

        return tmp;
    }

    async find(condition?: any) {
        return this._userModel.find(condition);
    }

    async findById(id: string, fields?: string) {
        let user = await this._userModel.findById(id, fields);
        if (!user) throw new BadRequest(UserError.USER_NOT_FOUND);
        return user;
    }

    async findUserWithFilter(conditions?: any) {
        return this._userModel.findWithFilter(conditions, UserSearchField);
    }

    async uploadAvatar(id: string, avatar: any) {
        try {
            let user = await this.findById(id);

            if (!user) throw new BadRequest(UserError.USER_NOT_FOUND);

            if (await this._storage.checkUploadFileType(avatar.path, ImageMIME)) {
                return await this._storage.storeUploadFile(avatar.path, 'avatar', id);
            }
            throw new BadRequest(UserError.AVATAR_WRONG_TYPE);
        } catch (err) {
            throw err;
        } finally {
            await this._storage.deleteFile(avatar.path);
        }
    }
}
