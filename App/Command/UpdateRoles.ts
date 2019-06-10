import { Injectable } from 'System/Injectable';
import { ICommand, IRole } from 'System/Interface';
import { Mongo } from 'System/Mongo';
import { PermissionModel } from 'System/RBAC/Models/PermissionModel';
import * as _ from 'lodash';
import { RoleModel } from 'System/RBAC/Models/RoleModel';

require('System/Helpers/Log');

interface IRoleSeed {
    readonly name: string;
    readonly description: string;
    readonly permissionPathPattern: { path: RegExp; method: RegExp }[];
}

@Injectable
export class UpdateRoles implements ICommand {
    constructor(
        private readonly _mongo: Mongo,
        private readonly _permissionModel: PermissionModel,
        private readonly _roleModel: RoleModel
    ) {}

    private roleSeeds: IRoleSeed[] = [
        {
            name: 'Global Administrator',
            description: 'Full permissions',
            permissionPathPattern: [{ path: /^\//, method: /.*/ }]
        },
        {
            name: 'RBAC Administrator',
            description: 'Control all aspects of Auth System',
            permissionPathPattern: [{ path: /^\/user/, method: /.*/ }, { path: /^\/rbac/, method: /.*/ }]
        },
        {
            name: 'Brand',
            description: 'Default role for all brands',
            permissionPathPattern: [
                { path: /^\/brand\/auth\/check/, method: /.*/ },
                { path: /^\/brand\/brands\/{id}\/avatar/, method: /.*/ },
                { path: /^\/brand\/brands\/bookmark-groups/, method: /.*/ },
                { path: /^\/brand\/brands\/sidebar-stats/, method: /.*/ },
                { path: /^\/brand\/brands\/influencer-groups/, method: /.*/ },
                { path: /^\/brand\/brands\/instant-groups/, method: /.*/ }
            ]
        },
        {
            name: 'FAQs Manager',
            description: 'Control all aspects of FAQs',
            permissionPathPattern: [{ path: /^\/admin\/faqs/, method: /.*/ }]
        },
        {
            name: 'KOL Package Manager',
            description: 'Control all aspects of KOL Package Service',
            permissionPathPattern: [
                { path: /^\/package/, method: /.*/ },
                { path: /^\/kol\/auth\/kol-users$/, method: /get/ },
                { path: /^\/metadata\/occupations$/, method: /.*/ },
                { path: /^\/metadata\/topics$/, method: /.*/ },
                { path: /^\/metadata\/tag-colors$/, method: /.*/ }
            ]
        },
        {
            name: 'Brand Manager',
            description: 'Control all aspects of Brand Service',
            permissionPathPattern: [{ path: /^\/brand/, method: /.*/ }]
        },
        {
            name: 'Kol',
            description: 'Default role for all kol',
            permissionPathPattern: [{ path: /^\/kol\//, method: /.*/ }, { path: /^\/request-payment\//, method: /.*/ }]
        },
        {
            name: 'Job Manager',
            description: 'Default role for job',
            permissionPathPattern: [
                { path: /^\/job\//, method: /.*/ },
                { path: /^\/kol-job\//, method: /.*/ },
                { path: /^\/brand\//, method: /get/ },
                { path: /^\/kol\//, method: /get/ }
            ]
        },
        {
            name: 'Kol Auth Manager',
            description: 'Default role for kol admin',
            permissionPathPattern: [
                { path: /^\/kol\/auth\//, method: /.*/ }
            ]
        },
        {
            name: 'Category Reason',
            description: 'Default role for category reason',
            permissionPathPattern: [
                { path: /^\/admin\/category-reasons/, method: /.*/ },
            ]
        }
    ];

    public async run() {
        console.log('Updating role list...');

        console.log('Total roles: ' + this.roleSeeds.length);

        let count = 0;

        for (let seed of this.roleSeeds) {
            let roleData: IRole;
            let permissionList: any = [];

            for (let pemRegEx of seed.permissionPathPattern) {
                permissionList.push(
                    (await this._permissionModel.find({
                        'route.path': pemRegEx.path,
                        'route.method': pemRegEx.method
                    })).map(item => item.id)
                );
            }

            permissionList = _.uniq(_.flattenDeep(permissionList));

            console.log('Found ' + permissionList.length + ' permissions for role ' + seed.name);

            roleData = {
                name: seed.name,
                description: seed.description,
                permissions: permissionList
            };

            await this._mongo
                .transaction(async session => {
                    let role = await this._roleModel.create(roleData, session);

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

                        count += 1;
                    }
                })
                .catch(async err => {
                    console.log('Duplicated!', seed.name, 'Update permissions...');

                    await this._mongo.transaction(async session1 => {
                        let role = await this._roleModel.findOne({ name: seed.name });

                        // clean permissions
                        let existingPermisisions = await this._permissionModel
                            .find({ _id: { $in: role!.permissions } })
                            .session(session1);

                        for (const permission of existingPermisisions) {
                            permission.roles = _.without(permission.roles.map(item => item.toString()), role!.id);
                            await permission.save({ session: session1 });
                        }

                        if (roleData.permissions && roleData.permissions.length > 0) {
                            const permissionInstances = await this._permissionModel
                                .find({ _id: { $in: roleData.permissions } })
                                .session(session1);
                            const availablePermissionIds: string[] = [];

                            for (const permission of permissionInstances) {
                                permission.roles = _.unionWith(permission.roles.map(item => item.toString()), [
                                    role!.id
                                ]);

                                await permission.save({ session: session1 });

                                availablePermissionIds.push(permission.id);
                            }
                            role!.permissions = availablePermissionIds;

                            await role!.save({ session: session1 });
                        }
                    });
                });
        }

        console.log('Total inserted roles: ' + count);

        console.log('Updating role list... DONE');
    }
}
