import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';

@Injectable
export class InitRoleBaseAccessControl implements ICommand {
    constructor(private readonly service: RBACService) {}

    public async run() {

        const user = await this.service.createRole({
            name: 'Staff',
            description: 'Base user for all admins'
        });

        const entry = await this.service.createPermission({
            route: {
                path: '/admin/auth/check',
                method: HTTP.Get
            },
            roles: [user._id]
        });

        const entry2 = await this.service.createPermission({
            route: {
                path: '/admin/faqs',
                method: HTTP.Get
            },
            roles: [user._id]
        });

        return [user, entry, entry2];
    }
}
