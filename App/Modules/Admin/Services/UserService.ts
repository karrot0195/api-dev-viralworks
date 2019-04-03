import * as Security from 'System/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { IUser, UserModel } from 'App/Models/UserModel';
import { generateUserCode } from 'App/Helpers/Generator';
import { RoleBasedAccessControlService } from 'System/RBAC/Service';
import { BadRequest } from 'System/Error';
import { RBACErrorMessage } from 'System/Enum/Error';

@Injectable
export class UserService {
    constructor(
        private readonly _config: Config,
        private readonly _userModel: UserModel,
        private readonly _RBACService: RoleBasedAccessControlService
    ) {}

    async create(data: IUser) {
        data.password = Security.hash(this._config.security.pepper + data.password);

        let codeExisted: any = false;

        while (!codeExisted) {
            data.code = generateUserCode('SU', 5);
            codeExisted = await this.find({ code: data.code });
        }

        if (data.role && data.role !== 'admin') {
            if (!(await this._RBACService.findRoleById(data.role)))
                throw new BadRequest(RBACErrorMessage.ROLE_NOT_FOUND);
        }

        let result = await this._userModel.create(data);
        result.password = '';

        return result;
    }

    async find(condition?: any) {
        return this._userModel.find(condition);
    }

    findById(id: string) {
        return this._userModel.findById(id);
    }
}
