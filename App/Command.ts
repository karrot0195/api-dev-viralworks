import { Injectable } from 'System/Injectable';
import { UpdatePermissions } from './Command/UpdatePermissions';
import { ICommand } from 'System/Interface';
import { CleanAuthSystem } from './Command/CleanAuthSystem';
import { UpdateRoles } from './Command/UpdateRoles';
import { UpdateUsers } from './Command/UpdateUsers';
import { InitAuthSystem } from './Command/InitAuthSystem';
import { SeederCommand } from './Command/SeederCommand';
import { CleanTmpFiles } from './Command/CleanTmpFile';
import { UpdateFacebookStats } from './Command/UpdateFacebookStats';
import { KolCommand } from 'App/Command/KolCommand';
import { JobSeedCommand } from 'App/Command/JobSeedCommand';
import { PostLinkCommand } from 'App/Command/PostLinkCommand';
import { EmailQueue } from './Command/EmailQueue';
import { FinishJobCommand } from 'App/Command/FinishJobCommand';

@Injectable
export class Command {
    readonly commands: { [key: string]: ICommand };
    constructor(
        updatePem: UpdatePermissions,
        cleanAuthSys: CleanAuthSystem,
        updateRole: UpdateRoles,
        updateUser: UpdateUsers,
        initAuthSys: InitAuthSystem,
        seederCommand: SeederCommand,
        cleanTmp: CleanTmpFiles,
        kolCommand: KolCommand,
        updateFb: UpdateFacebookStats,
        JobSeedCommand: JobSeedCommand,
        PostLinkCommand: PostLinkCommand,
        EmailQueue: EmailQueue,
        FinishJobCommand: FinishJobCommand
    ) {
        this.commands = {
            UpdatePem: updatePem,
            UpdateRole: updateRole,
            UpdateUser: updateUser,
            CleanAuthSys: cleanAuthSys,
            InitAuthSys: initAuthSys,
            SeederCommand: seederCommand,
            CleanTmp: cleanTmp,
            KolCommand: kolCommand,
            UpdateFb: updateFb,
            JobSeedCommand: JobSeedCommand,
            PostLinkCommand: PostLinkCommand,
            EmailQueue: EmailQueue,
            FinishJobCommand: FinishJobCommand
        };
    }
}
