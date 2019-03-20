import { Injectable } from 'System/Injectable';
import { InitRoleBaseAccessControl } from './Command/InitRoleBaseAccessControl';
import { CreateUser } from './Command/CreateUser';
import { UpdateRBAC } from './Command/UpdateRBAC';
import { ICommand } from 'System/Interface';

@Injectable
export class Command {
    readonly commands: { [key: string]: ICommand };
    constructor(
        initRBAC: InitRoleBaseAccessControl,
        updateRBAC: UpdateRBAC,
        createUser: CreateUser
    ) {
        this.commands = {
            InitRBAC: initRBAC,
            UpdateRBAC: updateRBAC,
            CreateUser: createUser
        };
    }
}