import * as _ from 'lodash';
import { Model, ClientSession } from 'mongoose';

import { Injectable } from '../Injectable';
import { Mongo } from '../Mongo';
import { IPermission, IRole } from '../Interface/RBAC';
import { Role, RoleSchema } from './Schema/RoleSchema';
import { Permission, PermissionSchema } from './Schema/PermissionSchema';

@Injectable
export class RoleBasedAccessControlService {
    private readonly _roleModel: Model<Role>;
    private readonly _permissionModel: Model<Permission>;

    constructor(
        private readonly _mongo: Mongo,
    ) {
        _mongo.define('role', { schema: RoleSchema });
        this._roleModel = _mongo.models['role'] as Model<Role>;

        _mongo.define('permission', { schema: PermissionSchema });
        this._permissionModel = _mongo.models['permission'] as Model<Permission>;
    }

    private async _resolveParentRoles(roleId: string, session: ClientSession | null = null): Promise<string[]> {
        const role = await this._roleModel.findById(roleId).session(session);

        if (role) {
            const temp = [role.id].concat(role.parents);
            return temp;
        }

        return [];
    }

    async createRole(role: IRole) {
        const temp = {
            name: role.name,
            description: role.description,
            parents: [] as string[]
        };

        if (role.parentId) {
            temp.parents = await this._resolveParentRoles(role.parentId);
        }

        return new this._roleModel(temp).save();
    }

    async findRoleById(id: string) {
        return this._roleModel.findById(id);
    }

    async findRoles(conditions?: any) {
        return this._roleModel.find(conditions);
    }

    async updateRoleById(roleId: string, roleData: IRole) {
        return this._mongo.transaction(async (session) => {
            const role = await this._roleModel.findById(roleId).session(session);

            if (role) {
                role.name = roleData.name;
                role.description = roleData.description;

                if (roleData.parentId && role.id !== roleData.parentId && roleData.parentId !== role.parents[0]) {
                    const parents = await this._resolveParentRoles(roleData.parentId, session);

                    if (parents.length > 0 && parents.indexOf(role.id) == -1) {
                        role.parents = parents;
                        const childRoles = await this._roleModel.find({ parents: role.id }).session(session);

                        for (const child of childRoles) {
                            const index = child.parents.indexOf(role.id);
                            child.parents.splice(index + 1);
                            child.parents = child.parents.concat(parents);
                            await child.save();
                        }
                    }
                }

                return role.save();
            }
            return role
        });
    }

    async deleteRoleById(roleId: string) {
        return this._mongo.transaction(async (session) => {
            const role = await this._roleModel.findById(roleId).session(session);

            if (!role) {
                return role;
            }

            if (role.permissions && role.permissions.length > 0) {
                const permissions = await this._permissionModel.find({ _id: { $in: role.permissions } });

                for (const permission of permissions) {
                    if (permission.roles) {
                        permission.roles = deleteInArray(role.id, permission.roles);
                        await permission.save({ session });
                    }
                }
            }

            const childRoles = await this._roleModel.find({ parents: role.id }).session(session);

            for (const child of childRoles) {
                const index = child.parents.indexOf(role.id);
                child.parents.splice(index);
                await child.save();
            }

            return role.remove();
        });
    }

    async deleteRole(conditions?: any) {
        return this._mongo.transaction(async (session) => {
            return this._roleModel.deleteMany(conditions).session(session);
        });
    }

    async createEntry(permissionData: IPermission) {
        return this._mongo.transaction(async (session) => {
            const permission = await new this._permissionModel(permissionData).save({ session });

            if (permissionData.roles && permissionData.roles.length > 0) {
                const roleInstances = await this._roleModel.find({ _id: { $in: permissionData.roles } }).session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions, [permission.id]);
                    await role.save({ session });
                    availableRoleIds.push(role.id);
                }
                permission.roles = availableRoleIds;
                return permission.save({ session });
            }
            return permission;
        });
    }

    async findPermissionById(permissionId: string) {
        return this._permissionModel.findById(permissionId);
    }

    async findPermissions(conditions?: any) {
        return this._permissionModel.find(conditions);
    }

    async setRolesForPermissionById(permissionId: string, roles: string[]) {
        return this._mongo.transaction(async (session) => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions, [permission.id]);
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                const diffRoleIds = _.differenceWith(permission.roles, availableRoleIds);

                if (diffRoleIds) {
                    const diffRoleInstances = await this._roleModel.find({ _id: { $in: diffRoleIds } }).session(session);

                    for (const diffRoleInstance of diffRoleInstances) {
                        diffRoleInstance.permissions = deleteInArray(permission.id, diffRoleInstance.permissions);
                        await diffRoleInstance.save();
                    }
                }

                permission.roles = availableRoleIds;
                return permission.save();
            }

            return permission;
        });
    }

    async addRolesForPermissionById(permissionId: string, roles: string[]) {
        return this._mongo.transaction(async (session) => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions, [permission.id]);
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                permission.roles = _.unionWith(permission.roles, availableRoleIds);
                return permission.save();
            }

            return permission;
        });
    }

    async setRolesForPermissionByIds(permissionIds: string[], roles: string[]) {
        return this._mongo.transaction(async (session) => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availablePermissionIds = permissions.map(item => item.id);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions, availablePermissionIds);
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                for (const permission of permissions) {
                    const diffRoleIds = _.differenceWith(permission.roles, availableRoleIds);

                    if (diffRoleIds) {
                        const diffRoleInstances = await this._roleModel.find({ _id: { $in: diffRoleIds } }).session(session);

                        for (const diffRoleInstance of diffRoleInstances) {
                            diffRoleInstance.permissions = deleteInArray(permission.id, diffRoleInstance.permissions);
                            await diffRoleInstance.save();
                        }
                    }

                    permission.roles = availableRoleIds;
                    await permission.save();
                }
            }

            return permissions;
        });
    }

    async addRolesForPermissionByIds(permissionIds: string[], roles: string[]) {
        return this._mongo.transaction(async (session) => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions && permissions.length > 0) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availablePermissionIds = permissions.map(item => item.id);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions, availablePermissionIds);
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                for (const permission of permissions) {
                    permission.roles = _.unionWith(permission.roles, availableRoleIds);
                    await permission.save();
                }
            }

            return permissions;
        });
    }

    async deletePermissionById(permissionId: string) {
        return this._mongo.transaction(async (session) => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: permission.roles } }).session(session);

                for (const roleInstance of roleInstances) {
                    roleInstance.permissions = deleteInArray(permission.id, roleInstance.permissions);
                    await roleInstance.save();
                }

                return permission.remove();
            }

            return permission;
        });
    }

    async deletePermissionByIds(permissionIds: string[]) {
        return this._mongo.transaction(async (session) => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions && permissions.length > 0) {
                const availablePermissionIds: string[] = [];
                let invokedRoleIds: string[] = [];

                for (const permission of permissions) {
                    availablePermissionIds.push(permission.id);
                    invokedRoleIds = _.unionWith(invokedRoleIds, permission.roles);
                    await permission.remove();
                }

                if (invokedRoleIds) {
                    const invokedRoles = await this._roleModel.find({ _id: { $in: invokedRoleIds } }).session(session);

                    for (const invokedRole of invokedRoles) {
                        if (invokedRole.permissions && invokedRole.permissions.length > 0) {
                            invokedRole.permissions = _.differenceWith(invokedRole.permissions, availablePermissionIds);
                            await invokedRole.save();
                        }
                    }
                }
            }

            return permissions;
        });
    }

    async deletePermission(conditions?: any) {
        return this._permissionModel.deleteMany(conditions);
    }
}

function deleteInArray(str: string, array: string[]) {
    if (array.length > 0) {
        const index = array.indexOf(str);

        if (index > -1) {
            array.splice(index, 1);
        }
    }

    return array;
}