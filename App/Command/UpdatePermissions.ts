import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { Mongo } from 'System/Mongo';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';
import { PermissionModel } from 'System/RBAC/Models/PermissionModel';

require('System/Helpers/Log');

@Injectable
export class UpdatePermissions implements ICommand {
    constructor(private readonly service: RBACService, private readonly _permissionModel: PermissionModel) {}

    public async run() {
        console.log('Updating permissions list...');

        let permisisonList = this.service.routePaths.map(item => {
            return {
                route: {
                    path: item.path,
                    method: item.method
                },
                name: item.name,
                roles: []
            };
        });
        console.log('Total route found: ' + permisisonList.length);

        let count;

        let results =
            (await this._permissionModel.insertMany(permisisonList, { ordered: false }).catch(err => {
                if (err.code === 11000) {
                    let tmp = err.result.result.writeErrors;

                    err.result.result.writeErrors.map(item => {
                        console.log('Duplicated! ' + permisisonList[item.index].name);
                    });
                    console.log('Total duplicated permission: ' + tmp.length);
                    count = err.result.result.nInserted;
                }
            })) || [];

        console.log('Total inserted permisison: ' + (count || results.length));

        console.log('Updating permissions list... DONE');

        return results;
    }
}
