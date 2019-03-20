import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';

@Injectable
export class InitRoleBaseAccessControl implements ICommand {
    constructor(private readonly service: RBACService) { }

    public async run() {
        // await this.service.deletePermission();
        const permission = await this.service.createPermission({
            route: {
                path: '/admin/roles/{id}',
                method: HTTP.Get
            },
            roles: ['5c8f3ff7b59bfc158cec3829']
        });

        return permission;
    }
}