import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { Mongo } from 'System/Mongo';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';

@Injectable
export class UpdateRBAC implements ICommand {
    constructor(private readonly service: RBACService) { }

    public async run() {
        // const result = await this.service.setRolesForPermissionById('5c8f4df16f498a9bb0354b95', ['5c8f3ff7b59bfc158cec3829', '5c8f3ff7b59bfc158cec3827', '5c8f3ff8b59bfc158cec382b']);
        // const result = await this.service.deletePermissionById('5c8f4e814a0b124064bda240');
        const result = await this.service.deletePermissionById('5c8f678a30e3c131e8810401');
        await this.service.deletePermissionById('5c8f68128ac95126f42c9c8e');
        return result;
    }
}