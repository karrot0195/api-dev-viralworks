import { BaseModel } from "System/BaseModel";
import { JobInvite } from "Database/Schema/JobInviteSchema";
import { Mongo } from "System/Mongo";
import { Injectable } from "System/Injectable";

export enum JobInviteStatus {
    Raw = 1,
    Join = 2,
    Reject = -1
} 

export interface IJobInvite {
    readonly kol_id: string,
    readonly job_id: string,
    readonly price: number;
}

@Injectable
export class JobInviteModel extends BaseModel<IJobInvite, JobInvite> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'job_invite');
    }
}