import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { CategoryReason } from "Database/Schema/CategoryReasonSchema";
import { Mongo } from "System/Mongo";

export interface IReason {
    readonly name: string
}

export interface ICategoryReason {
    readonly name: string,
    readonly reasons: Array<IReason>
}

@Injectable
export class CategoryReasonModel extends BaseModel<ICategoryReason, CategoryReason> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'category_reasons');
    }

}