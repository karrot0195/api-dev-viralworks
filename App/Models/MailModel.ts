import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { Mail } from 'Database/Schema/MailSchema';

export enum MailStatus {
    Success = 1,
    Fail = 0,
    Waiting = -1
}

export enum MailType {
    VERIFY_KOL = 1,
    REJECT_KOL = 2,
    REQUIRE_UPDATE_FACEBOO_LINK = 3,
    INVITE_JOB = 4,
    KOL_JOB = 5,
    POST_JOB_CONTENT = 6,
    POST_JOB_LINK = 7,
    KOL_JOB_CLOSE = 8,
    KOl_JOB_PAYMENT = 9,
    BRAND_FORGOT_PASSWORD = 10,
    ACCEPT_REQUEST_PAYMENT = 11,
    REJECT_REQUEST_PAYMENT = 12,
    KOL_FORGOT_PASSWORD = 13,
    KOL_VERIFY_EMAIL = 14,
    KOL_JOB_STATUS = 15,
    ADMIN_STATUS = 16
}

export const mailCron: Map<MailType, Object> = new Map([
    [MailType.ADMIN_STATUS, { repeat: { cron: '0 0 12 1/1 * ?', limit: 1 } }]
]);

export interface IMail {
    readonly message_id: string;
    readonly email: string;
    readonly mail_type: number;
    readonly events: Array<IEventMail>;
    readonly event_latest: string;
    readonly status: number;
}

export interface IEventMail {
    readonly event: string;
    readonly timestamp: number;
}

@Injectable
export class MailModel extends BaseModel<IMail, Mail> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'mail');
    }
}
