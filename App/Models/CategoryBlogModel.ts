import { Injectable } from "System/Injectable";
import { Mongo } from "System/Mongo";
import { BaseModel } from "System/BaseModel";
import { CategoryBlog } from "Database/Schema/CategoryBlogSchema";

interface ICategoryBlog {
    readonly name: string;
    readonly slug: string;
}

@Injectable
export class CategoryBlogModel extends BaseModel<ICategoryBlog, CategoryBlog> {
    constructor(private _mongo: Mongo) {
        super(_mongo, 'category_blog');
    }
}