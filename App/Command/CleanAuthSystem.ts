import { Injectable } from 'System/Injectable';
import { ICommand, IRole } from 'System/Interface';
import { Mongo } from 'System/Mongo';
import { RoleModel } from 'System/RBAC/Models/RoleModel';
import { PermissionModel } from 'System/RBAC/Models/PermissionModel';
import { UserModel } from 'App/Models/UserModel';
import { BlacklistModel } from 'App/Models/BlacklistModel';
import * as request from 'request';
import { Config } from 'System/Config';

require('System/Helpers/Log');

@Injectable
export class CleanAuthSystem implements ICommand {
    constructor(
        private readonly _mongo: Mongo,
        private readonly _userModel: UserModel,
        private readonly _roleModel: RoleModel,
        private readonly _permissionModel: PermissionModel,
        private readonly _blacklistModel: BlacklistModel,
        private readonly _config: Config
    ) {}

    public async run() {
        console.log('Cleaning Auth System...');

        await this._mongo.transaction(async session => {
            await this._userModel.deleteMany({}).session(session);

            await this._permissionModel.deleteMany({}).session(session);

            await this._roleModel.deleteMany({}).session(session);

            await this._blacklistModel.deleteMany({}).session(session);
        });

        let url =
            'http://' +
            this._config.server.host +
            ':' +
            this._config.server.port +
            '/' +
            this._config.version +
            '/rbac/update-rbac';

        await new Promise(resolve =>
            request.get(url, function(error, response, body) {
                console.log(error, body);
                resolve();
            })
        );

        return 'Cleaning Auth System... DONE';
    }
}
