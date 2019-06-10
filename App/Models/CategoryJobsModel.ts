import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { Mongo } from "System/Mongo";
import { CategoryJob } from "Database/Schema/CategoryJobsSchema";

export interface IJob {
    readonly name: string,
    readonly static_id: number;
}

export interface ICategoryJob {
    readonly name: string,
    readonly jobs: Array<IJob>
}

@Injectable
export class CategoryJobModel extends BaseModel<ICategoryJob, CategoryJob> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'category_job');
    }

}