import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { UpdatePermissions } from './UpdatePermissions';
import { UpdateRoles } from './UpdateRoles';
import { UpdateUsers } from './UpdateUsers';
import * as request from 'request';
import { Config } from 'System/Config';

require('System/Helpers/Log');

@Injectable
export class InitAuthSystem implements ICommand {
    constructor(
        private readonly _updatePermisison: UpdatePermissions,
        private readonly _updateRole: UpdateRoles,
        private readonly _updateUser: UpdateUsers,
        private readonly _config: Config
    ) {}

    public async run() {
        console.log('Init Auth System...');

        await this._updatePermisison.run();

        await this._updateRole.run();

        await this._updateUser.run();

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

        return 'Init Auth System... DONE';
    }
}
