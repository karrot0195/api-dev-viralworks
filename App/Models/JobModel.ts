import { Injectable } from 'System/Injectable';
import { BaseModel } from 'System/BaseModel';
import { Job } from 'Database/Schema/JobSchema';
import { Mongo } from 'System/Mongo';
import { IGroupItem, ITimeItem, IQuestionItem } from 'App/Constants/Models/Job/IJobItem';

export interface IJob {
    readonly cover_image: boolean;
    readonly title: string;
    readonly description: string;
    readonly assign_brand: string;
    readonly type: number;
    readonly sharelink: string;
    readonly hashtags: Array<string>;
    readonly social: number;
    readonly special_requirement: string;
    readonly sample_post: boolean;
    readonly thing_avoid: string;
    readonly content_requirement: string;
    readonly questions: Array<IQuestionItem>;
    readonly time: Array<ITimeItem>;
    readonly groups: Array<IGroupItem>;
    readonly status: number;
    readonly manager_by: string;
    readonly kpi: {
        readonly post: number;
        readonly buzz: number;
        readonly engagement: number;
    };
    readonly groups_reference: string;
}

export const FieldNotAllow = ['status', 'engagement', 'groups', 'invites', 'kol_jobs', 'cover_image', 'sample_post'];

export enum JobStatus {
    Raw = 1,
    Running = 2,
    Finish = 3,
    Close = 4
}

export enum JobType {
    Photo = 1,
    Livestream = 2,
    Video = 3,
    Sharelink = 4
}

export enum JobSocial {
    Facebook = 1,
    Instagram = 2
}

export const SearchField = ['title', 'description'];

@Injectable
export class JobModel extends BaseModel<IJob, Job> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'job');
    }
}
