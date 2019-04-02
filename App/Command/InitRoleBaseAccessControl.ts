import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand, IRole } from 'System/Interface';
import { Mongo } from 'System/Mongo';
import { RoleModel } from 'System/RBAC/Models/RoleModel';
import { PermissionModel } from 'System/RBAC/Models/PermissionModel';

@Injectable
export class InitRoleBaseAccessControl implements ICommand {
    constructor(
        private readonly _mongo: Mongo,
        private readonly _roleModel: RoleModel,
        private readonly _permissionModel: PermissionModel
    ) {}

    public async run() {
        let firstRole: IRole = {
            name: 'Staff',
            description: 'Base user for all dashboard user'
        };

        let firstEntry: any = {
            route: {
                path: '/admin/auth/check',
                method: HTTP.Get
            },
            description: 'API check token'
        };

        return this._mongo.transaction(async session => {
            const role = await this._roleModel.create(firstRole, session);
            firstEntry.roles = [role._id];
            const entry = await this._permissionModel.create(firstEntry, session);

            return [role, entry];
        });
    }
}
