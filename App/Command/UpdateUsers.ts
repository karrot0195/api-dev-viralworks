import { Injectable } from 'System/Injectable';
import { ICommand, IRole } from 'System/Interface';
import * as _ from 'lodash';
import { RoleModel } from 'System/RBAC/Models/RoleModel';
import { IUser, UserModel } from 'App/Models/UserModel';
import * as Security from 'System/Helpers/Security';
import { generateUserCode } from 'App/Helpers/Generator';
import { Config } from 'System/Config';

require('System/Helpers/Log');

interface IUserSeed {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly roles: string[];
}

export const userSeeds: IUserSeed[] = [
    {
        name: 'Global Administrator',
        email: 'super_admin@admin.com',
        password: 'viralworks@2018',
        roles: ['Global Administrator']
    }
    // {
    //     name: 'RBAC Administrator',
    //     email: 'rbac_admin@admin.com',
    //     password: 'viralworks@2018',
    //     roles: ['RBAC Administrator']
    // },
    // {
    //     name: 'FAQs Manager',
    //     email: 'faqs_manager@admin.com',
    //     password: 'viralworks@2018',
    //     roles: ['FAQs Manager']
    // },
    // {
    //     name: 'KOL Package Manager',
    //     email: 'kol_package_manager@admin.com',
    //     password: 'viralworks@2018',
    //     roles: ['KOL Package Manager']
    // },
    // {
    //     name: 'Brand Manager',
    //     email: 'brand_manager@admin.com',
    //     password: 'viralworks@2018',
    //     roles: ['Brand Manager']
    // }
];

@Injectable
export class UpdateUsers implements ICommand {
    constructor(
        private readonly _config: Config,
        private readonly _userModel: UserModel,
        private readonly _roleModel: RoleModel
    ) {}

    public async run() {
        console.log('Updating user list...');

        let userList: IUser[] = [];

        console.log('Total users: ' + userSeeds.length);

        for (let user of userSeeds) {
            let roleList: any = [];

            for (let role of user.roles) {
                roleList.push((await this._roleModel.find({ name: role })).map(item => item.id));
            }

            roleList = _.uniq(_.flattenDeep(roleList));

            let password = Security.hash(this._config.security.pepper + user.password);

            let codeExisted: any = false;

            let code: string = '';

            while (!codeExisted) {
                code = generateUserCode('SU', 5);
                codeExisted = await this._userModel.find({ code: code });
            }

            let is_disabled = false;

            userList.push({
                name: user.name,
                email: user.email,
                password: password,
                code: code,
                roles: roleList,
                is_disabled: is_disabled
            });
        }

        let count;

        let results =
            (await this._userModel.insertMany(userList, { ordered: false }).catch(err => {
                if (err.code === 11000) {
                    let tmp = err.result.result.writeErrors;

                    err.result.result.writeErrors.map(item => {
                        console.log('Duplicated! ' + userList[item.index].name);
                    });

                    console.log('Total duplicated users: ' + tmp.length);

                    count = err.result.result.nInserted;
                }
            })) || [];

        console.log('Total inserted users: ' + (count || results.length));

        console.log('Updating user list... DONE');

        return;
    }
}
