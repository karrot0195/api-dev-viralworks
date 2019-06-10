import { BaseModel } from 'System/BaseModel';
import { KolJob } from 'Database/Schema/KolJobSchema';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';

export interface IKolJob {
    readonly kol_id: string;
    readonly job_id: string;
    readonly price: number;
    readonly time: string;
}

export interface IKolJobPost {
    readonly content: String;
    readonly link: String;
    readonly id: String;
}

export enum KolJobPostStatus {
    Raw = 1,
    Content = 2,
    Link = 3
}

export enum KolJobAction {
    Accept = 1,
    Reject = -1,
    Block = 2,
    Unblock = 3,
    Request = 4
}

export enum KolJobStatus {
    Active = 1,
    CloseJob = 2,
    Payment = 3,
    RejectPayment = 4
}

export const SearchField = ['kol_id', 'job_id'];

@Injectable
export class KolJobModel extends BaseModel<IKolJob, KolJob> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'kol_job');
    }
}
