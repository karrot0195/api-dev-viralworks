import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { Mongo } from "System/Mongo";
import { CategoryShareStory } from "Database/Schema/CategoryShareStorysSchema";

export interface IShareStory {
    readonly name: string,
    readonly static_id: number;
}

export interface ICategoryShareStory {
    readonly name: string,
    readonly share_stories: Array<IShareStory>
}

@Injectable
export class CategoryShareStoryModel extends BaseModel<ICategoryShareStory, CategoryShareStory> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'category_share_story');
    }

}