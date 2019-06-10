import * as _ from 'lodash';
import * as ms from 'ms';
import { ClientSession } from 'mongoose';

import { Injectable } from '../Injectable';
import { Mongo } from '../Mongo';
import { IRole, IPermission, IRoutePath } from 'System/Interface/RBAC';
import { PermissionModel } from './Models/PermissionModel';
import { RoleModel } from './Models/RoleModel';
import { PermissionSearchField } from './Schema/PermissionSchema';
import { RoleSearchField, RoleBlacklist } from './Schema/RoleSchema';
import { BadRequest } from 'System/Error/BadRequest';
import { InternalError } from 'System/Error/InternalError';
import { NotFound } from 'System/Error/NotFound';
import { BlacklistModel, IBlacklist } from 'App/Models/BlacklistModel';
import { Config } from 'System/Config';
import { BlacklistReason } from 'System/Enum/BlacklistReason';
import { UserModel } from 'App/Models/UserModel';

@Injectable
export class RoleBasedAccessControlService {
    readonly routePathsWithModule: { [module: string]: IRoutePath[] } = {};
    readonly routePaths: IRoutePath[] = [];
    readonly paths: string[] = [];
    readonly defaultRolePopulation = [
        { path: 'inherited_permissions', select: 'route name' },
        { path: 'permissions', select: 'route name' },
        { path: 'parent_id', select: 'name' },
        { path: 'parents', select: 'name' }
    ];
    readonly defaultPermissionPopulation = { path: 'roles', select: 'name' };
    public _blacklist: any[];

    constructor(
        private readonly _mongo: Mongo,
        private readonly _roleModel: RoleModel,
        private readonly _permissionModel: PermissionModel,
        private readonly _userModel: UserModel,
        private readonly _blacklistModel: BlacklistModel,
        private readonly _config: Config
    ) {}

    async loadBlacklist() {
        console.log('Updating Blacklist...');

        this._blacklist = await this.findBlacklist();

        if (this._config.env === 'dev') console.log('Black list contains:', this._blacklist);

        console.log('Updating Blacklist... - DONE');
    }

    private async _resolveParentRoles(roleId: string, session: ClientSession | null = null): Promise<string[]> {
        const role = await this._roleModel.findById(roleId).session(session);

        if (role) {
            const temp = [role.id].concat(role.parents.map(item => item.toString()));
            return temp;
        }

        throw new BadRequest({ fields: { parent_id: 'PARENT_NOT_FOUND' } });
    }

    async createRole(roleData: IRole) {
        const temp = {
            name: roleData.name,
            description: roleData.description,
            parents: [] as string[],
            parent_id: roleData.parent_id
        };

        await this.validatePermission(roleData);

        if (roleData.parent_id) {
            temp.parents = await this._resolveParentRoles(roleData.parent_id);
        }

        return this._mongo.transaction(async session => {
            let role = await this._roleModel.create(temp, session);

            if (roleData.permissions && roleData.permissions.length > 0) {
                const permissionInstances = await this._permissionModel
                    .find({ _id: { $in: roleData.permissions } })
                    .session(session);
                const availablePermissionIds: string[] = [];

                for (const permission of permissionInstances) {
                    permission.roles = _.unionWith(permission.roles.map(item => item.toString()), [role.id]);

                    await permission.save({ session });

                    availablePermissionIds.push(permission.id);
                }
                role.permissions = availablePermissionIds;

                await role.save({ session });
            }

            role.inherited_permissions = await this.findParentPermisison(role.parents);

            role.parents = [];

            return role.populate(this.defaultRolePopulation).execPopulate();
        });
    }

    async findRoleById(id: string, fields?: string) {
        let role = await this._roleModel.findById(id, fields);

        if (!role) throw new NotFound('ROLE_NOT_FOUND');

        role.inherited_permissions = await this.findParentPermisison(role.parents);

        role.set('parents', undefined);

        return role.populate(this.defaultRolePopulation).execPopulate();
    }

    async findParentPermisison(parents: string[]) {
        let tmp = await this.findPermissions({ roles: { $in: parents } });

        return _.sortedUniq(tmp.map(item => item._id.toString()));
    }

    async findRoleByIds(roles: string[], fields?: string) {
        let conditions = {
            _id: {
                $in: roles
            }
        };

        return this._roleModel.find(conditions);
    }

    async findRoles(conditions?: any) {
        return this._roleModel.find(conditions);
    }

    async findBlacklist() {
        return this._blacklistModel.find();
    }

    async disableUser(id: string, basePath: string, session: ClientSession) {
        let blacklistUser: IBlacklist = {
            disabled_user: {
                id_string: id,
                reason: BlacklistReason.DISABLE
            }
        };

        if (this._config.env === 'dev') console.log('DEBUG: disable user:', blacklistUser);

        return this._blacklistModel.create(blacklistUser, session);
    }

    async disableToken(id: string, reason: BlacklistReason, session: ClientSession) {
        let blacklistUser: IBlacklist = {
            disabled_user: {
                id_string: id,
                reason: reason
            },
            issued_at: Date.now(),
            expired_at: Date.now() + ms(this._config.jwt.expire)
        };

        if (this._config.env === 'dev') console.log('DEBUG: disable token:', blacklistUser);

        let blacklistItem = await this._blacklistModel.findOne({
            disabled_user: {
                id_string: id,
                reason: reason
            }
        });

        if (!blacklistItem) return this._blacklistModel.create(blacklistUser, session);

        // in case of duplicated
        return this._blacklistModel.updateOne(
            {
                disabled_user: {
                    id_string: id,
                    reason: reason
                }
            },
            {
                disabled_user: {
                    id_string: id,
                    reason: reason
                },
                issued_at: Date.now(),
                expired_at: Date.now() + ms(this._config.jwt.expire)
            },
            { session }
        );
    }

    async enableUser(id: string, basePath: string, session: ClientSession) {
        let blacklistUser: IBlacklist = {
            disabled_user: {
                id_string: id,
                reason: BlacklistReason.DISABLE
            }
        };

        if (this._config.env === 'dev') console.log('DEBUG: Enable user:', blacklistUser);

        return this._blacklistModel.deleteOne(blacklistUser).session(session);
    }

    async removeBlacklistToken(id: string, basePath: string, session: ClientSession) {
        let blacklistUser: IBlacklist = {
            disabled_user: {
                id_string: id,
                reason: BlacklistReason.CHANGE_PASSWORD
            }
        };

        if (this._config.env === 'dev') console.log('DEBUG: Enable user:', blacklistUser);

        return this._blacklistModel.deleteOne(blacklistUser).session(session);
    }

    async findRolesWithFilter(conditions?: any) {
        let tmp = await this._roleModel.findWithFilter(conditions, RoleSearchField, {
            beforeQuery: this.blacklistRole
        });

        for await (let role of tmp.results) {
            await role.populate(this.defaultRolePopulation).execPopulate();

            role.set('permissions', undefined);
            role.set('inherited_permissions', undefined);
            role.set('parents', undefined);
        }

        return tmp;
    }

    private blacklistRole(query: any) {
        if (!query.conditions['name']) query.conditions['name'] = {};

        query.conditions['name'].$nin = RoleBlacklist;
    }

    async updateRoleById(roleId: string, roleData: IRole) {
        return this._mongo.transaction(async session => {
            const role = await this._roleModel.findById(roleId).session(session);

            if (role) {
                if (roleData.name) role.name = roleData.name;
                if (roleData.description) role.description = roleData.description;

                if (roleData.parent_id !== undefined && role.id != roleData.parent_id) {
                    let parents: any = [];

                    if (roleData.parent_id) parents = await this._resolveParentRoles(roleData.parent_id, session);

                    if (parents.indexOf(role.id) == -1) {
                        role.parents = parents;

                        role.parent_id = undefined;

                        if (roleData.parent_id !== '') role.parent_id = roleData.parent_id;

                        const childRoles = await this._roleModel.find({ parents: role.id }).session(session);

                        for (const child of childRoles) {
                            const index = child.parents.map(item => item.toString()).indexOf(role.id);

                            child.parents.splice(index + 1);

                            child.parents = child.parents.concat(parents);

                            await child.save({ session });
                        }
                    }
                }

                if (roleData.permissions !== undefined) {
                    // Clean permission first, in case of remove role
                    const existedPermissions = await this._permissionModel
                        .find({ _id: { $in: role.permissions } })
                        .session(session);

                    for (const permission of existedPermissions) {
                        permission.roles = _.without(permission.roles.map(item => item.toString()), role.id);
                        await permission.save({ session });
                    }

                    role.permissions = [];

                    if (roleData.permissions && roleData.permissions.length > 0) {
                        const permissionInstances = await this._permissionModel
                            .find({ _id: { $in: roleData.permissions } })
                            .session(session);
                        const availablePermisisonIds: string[] = [];

                        for (const permisison of permissionInstances) {
                            permisison.roles = _.unionWith(permisison.roles.map(item => item.toString()), [role.id]);
                            await permisison.save({ session });
                            availablePermisisonIds.push(permisison.id);
                        }
                        role.permissions = availablePermisisonIds;
                    }
                }

                await role.save({ session });

                role.inherited_permissions = await this.findParentPermisison(role.parents);

                await role.populate(this.defaultRolePopulation).execPopulate();

                role.parents = [];
            }

            return role;
        });
    }

    async deleteRoleById(roleId: string) {
        await this._mongo.transaction(async session => {
            const role = await this._roleModel.findById(roleId).session(session);

            if (!role) throw new NotFound('ROLE_NOT_FOUND');

            const users = await this._userModel.find({ roles: { $in: [roleId] } });
            if (users.length > 0) {
                for (const user of users) {
                    user.roles = deleteInArray(roleId, user.roles.map(item => item.toString()));

                    await user.save({ session });

                    await this.disableToken(user.id, BlacklistReason.CHANGE_ROLE, session);
                }
            }

            if (role.permissions && role.permissions.length > 0) {
                const permissions = await this._permissionModel.find({ _id: { $in: role.permissions } });

                for (const permission of permissions) {
                    if (permission.roles) {
                        permission.roles = deleteInArray(role.id, permission.roles.map(item => item.toString()));
                        await permission.save({ session });
                    }
                }
            }

            const childRoles = await this._roleModel.find({ parents: { $in: [role.id] } }).session(session);
            for (const child of childRoles) {
                if (child.parent_id === role.id) child.parent_id = '';
                const index = child.parents.map(item => item.toString()).indexOf(role.id);
                child.parents.splice(index);
                await child.save({ session });
            }

            return role.remove();
        });

        await this.loadBlacklist();

        return { deleted: roleId };
    }

    async deleteRole(conditions?: any) {
        return this._mongo.transaction(async session => {
            return this._roleModel.deleteMany(conditions).session(session);
        });
    }

    async createPermission(permissionData: IPermission) {
        let route = await this.validatePath(permissionData);
        await this.validateRole(permissionData);

        return this._mongo.transaction(async session => {
            permissionData.name = route.name;

            const permission = await this._permissionModel.create(permissionData, session);

            if (permissionData.roles && permissionData.roles.length > 0) {
                const roleInstances = await this._roleModel
                    .find({ _id: { $in: permissionData.roles } })
                    .session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions.map(item => item.toString()), [permission.id]);
                    await role.save({ session });
                    availableRoleIds.push(role.id);
                }
                permission.roles = availableRoleIds;
            }

            await permission.save({ session });

            return permission.populate(this.defaultPermissionPopulation).execPopulate();
        });
    }

    async updatePermissionById(PermissionId: string, permissionData: IPermission) {
        await this.validateRole(permissionData);

        return this._mongo.transaction(async session => {
            const permission = await this._permissionModel.findById(PermissionId).session(session);

            if (permission) {
                permission.name = permissionData.name || permission.name;

                if (permissionData.roles !== undefined) {
                    // Clean role first, in case of remove role
                    const existingRoles = await this._roleModel
                        .find({ _id: { $in: permission.roles } })
                        .session(session);

                    for (const role of existingRoles) {
                        role.permissions = _.without(role.permissions.map(item => item.toString()), permission.id);
                        await role.save({ session });
                    }

                    permission.roles = [];

                    if (permissionData.roles && permissionData.roles.length > 0) {
                        const roleInstances = await this._roleModel
                            .find({ _id: { $in: permissionData.roles } })
                            .session(session);
                        const availableRoleIds: string[] = [];

                        for (const role of roleInstances) {
                            role.permissions = _.unionWith(role.permissions.map(item => item.toString()), [
                                permission.id
                            ]);
                            await role.save({ session });
                            availableRoleIds.push(role.id);
                        }
                        permission.roles = availableRoleIds;
                    }
                }

                await permission.save({ session });

                return permission.populate(this.defaultPermissionPopulation).execPopulate();
            }
            return permission;
        });
    }

    async findPermissionById(permissionId: string, fields?: string) {
        let permisison = await this._permissionModel.findById(permissionId, fields);

        if (!permisison) throw new NotFound('PERMISSION_NOT_FOUND');

        return permisison.populate(this.defaultPermissionPopulation).execPopulate();
    }

    async findPermissions(conditions?: any, projections: any = {}) {
        return await this._permissionModel.find(conditions, projections);
    }

    async findPermissionWithFilter(query?: any) {
        return this._permissionModel.findWithFilter(query, PermissionSearchField, undefined, {
            path: 'roles',
            select: 'name'
        });
    }

    async setRolesForPermissionById(permissionId: string, roles: string[]) {
        return this._mongo.transaction(async session => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions.map(item => item.toString()), [permission.id]);
                    await role.save({ session });
                    availableRoleIds.push(role.id);
                }

                const diffRoleIds = _.differenceWith(permission.roles.map(item => item.toString()), availableRoleIds);

                if (diffRoleIds) {
                    const diffRoleInstances = await this._roleModel
                        .find({ _id: { $in: diffRoleIds } })
                        .session(session);

                    for (const diffRoleInstance of diffRoleInstances) {
                        diffRoleInstance.permissions = deleteInArray(
                            permission.id,
                            diffRoleInstance.permissions.map(item => item.toString())
                        );
                        await diffRoleInstance.save({ session });
                    }
                }

                permission.roles = availableRoleIds;
                return permission.save({ session });
            }

            return permission;
        });
    }

    async addRolesForPermissionById(permissionId: string, roles: string[]) {
        return this._mongo.transaction(async session => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(role.permissions.map(item => item.toString()), [permission.id]);
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                permission.roles = _.unionWith(permission.roles.map(item => item.toString()), availableRoleIds);
                return permission.save();
            }

            return permission;
        });
    }

    async setRolesForPermissionByIds(permissionIds: string[], roles: string[]) {
        return this._mongo.transaction(async session => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availablePermissionIds = permissions.map(item => item.id);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(
                        role.permissions.map(item => item.toString()),
                        availablePermissionIds
                    );
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                for (const permission of permissions) {
                    const diffRoleIds = _.differenceWith(
                        permission.roles.map(item => item.toString()),
                        availableRoleIds
                    );

                    if (diffRoleIds) {
                        const diffRoleInstances = await this._roleModel
                            .find({ _id: { $in: diffRoleIds } })
                            .session(session);

                        for (const diffRoleInstance of diffRoleInstances) {
                            diffRoleInstance.permissions = deleteInArray(
                                permission.id,
                                diffRoleInstance.permissions.map(item => item.toString())
                            );
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
        return this._mongo.transaction(async session => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions && permissions.length > 0) {
                const roleInstances = await this._roleModel.find({ _id: { $in: roles } }).session(session);
                const availablePermissionIds = permissions.map(item => item.id);
                const availableRoleIds: string[] = [];

                for (const role of roleInstances) {
                    role.permissions = _.unionWith(
                        role.permissions.map(item => item.toString()),
                        availablePermissionIds
                    );
                    await role.save();
                    availableRoleIds.push(role.id);
                }

                for (const permission of permissions) {
                    permission.roles = _.unionWith(permission.roles.map(item => item.toString()), availableRoleIds);
                    await permission.save();
                }
            }

            return permissions;
        });
    }

    async deletePermissionById(permissionId: string) {
        return this._mongo.transaction(async session => {
            const permission = await this._permissionModel.findById(permissionId).session(session);

            if (permission) {
                const roleInstances = await this._roleModel.find({ _id: { $in: permission.roles } }).session(session);

                for (const roleInstance of roleInstances) {
                    roleInstance.permissions = deleteInArray(
                        permission.id,
                        roleInstance.permissions.map(item => item.toString())
                    );
                    await roleInstance.save();
                }

                return permission.remove();
            }

            return permission;
        });
    }

    async deletePermissionByIds(permissionIds: string[]) {
        return this._mongo.transaction(async session => {
            const permissions = await this._permissionModel.find({ _id: { $in: permissionIds } }).session(session);

            if (permissions && permissions.length > 0) {
                const availablePermissionIds: string[] = [];
                let invokedRoleIds: string[] = [];

                for (const permission of permissions) {
                    availablePermissionIds.push(permission.id);
                    invokedRoleIds = _.unionWith(invokedRoleIds, permission.roles.map(item => item.toString()));
                    await permission.remove();
                }

                if (invokedRoleIds) {
                    const invokedRoles = await this._roleModel.find({ _id: { $in: invokedRoleIds } }).session(session);

                    for (const invokedRole of invokedRoles) {
                        if (invokedRole.permissions && invokedRole.permissions.length > 0) {
                            invokedRole.permissions = _.differenceWith(
                                invokedRole.permissions.map(item => item.toString()),
                                availablePermissionIds
                            );
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

    private async validatePath(permissionData: IPermission) {
        let checkRoute: any = this.routePaths.find(element => {
            return element.path === permissionData.route.path && element.method === permissionData.route.method;
        });

        if (!checkRoute) throw new InternalError('PATH_NOT_FOUND');

        return checkRoute;
    }

    private async validateRole(permissionData: IPermission) {
        if (!permissionData.roles || permissionData.roles.length === 0) return;

        let checkRole = await this._roleModel.find({ _id: { $in: permissionData.roles } });

        if (checkRole.length !== permissionData.roles.length)
            throw new BadRequest({ fields: { roles: 'ROLE_NOT_FOUND' } });

        return;
    }

    private async validatePermission(roleData: IRole) {
        if (!roleData.permissions || roleData.permissions.length === 0) return;

        let checkPermission = await this._permissionModel.find({ _id: { $in: roleData.permissions } });

        if (checkPermission.length !== roleData.permissions.length)
            throw new BadRequest({ fields: { permisisons: 'PERMISSION_NOT_FOUND' } });

        return;
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
