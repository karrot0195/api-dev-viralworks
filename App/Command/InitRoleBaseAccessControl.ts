import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';
import { rootRenderNodes } from '@angular/core/src/view';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';

@Injectable
export class InitRoleBaseAccessControl implements ICommand {
    constructor(private readonly service: RBACService) {}

    public async run() {
        // TODO: resolve this magic
        const roles = await this.service.findPermissions();

        const user = await this.service.createRole({
            name: 'User',
            description: 'Base user for all user',
        });

        const entry = await this.service.createPermission({
            route: {
                path: '/auth/check',
                method: HTTP.Get,
            },
            roles: [user._id],
        });

        const entry2 = await this.service.createPermission({
            route: {
                path: '/test',
                method: HTTP.Get,
            },
            roles: [user._id],
        });

        return [user, entry, entry2];
    }
}
