import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { Mail } from 'Database/Schema/MailSchema';

export enum MailStatus {
    Success = 1,
    Fail = 0
}

export interface IMail {
    readonly message_id: string,
    readonly email: string,
    readonly events: Array<IEventMail>,
    readonly event_latest: string,
    readonly status: number
}

export interface IEventMail {
    readonly event: string,
    readonly timestamp: number,

}

@Injectable
export class MailModel extends BaseModel<IMail, Mail> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'mail');
    }

    create(data: IMail) {
        return this._model.create(data);
    }
}
