import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { Blacklist } from 'Database/Schema/BlacklistSchema';
import { BlacklistReason } from 'System/Enum/BlacklistReason';

export interface IBlacklist {
    disabled_user: {
        id_string: string;
        reason: BlacklistReason;
    };
    issued_at?: number;
    expired_at?: number;
}

@Injectable
export class BlacklistModel extends BaseModel<IBlacklist, Blacklist> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'blacklist');
    }
}
