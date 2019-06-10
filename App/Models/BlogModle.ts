import { Injectable } from "System/Injectable";
import { Mongo } from "System/Mongo";
import { BaseModel } from "System/BaseModel";
import { Blog } from "Database/Schema/BlogSchema";

interface IBlog {
    readonly title: string;
    readonly content: string;
    readonly categories: Array<string>;
    readonly base_title: string;
    readonly status: number;
    readonly excerpt: string;
    readonly thumbnail: string;
    readonly source: string;
    readonly keywords: Array<string>;
    readonly image_cover: string;
    readonly date_published: Date;
    readonly excerpt_num_limit: number;
    readonly thumbnail_alt: string;
    readonly image_cover_alt: string;
    readonly main_post: boolean;
}

@Injectable
export class BlogModel extends BaseModel<IBlog, Blog> {
    constructor(private _mongo: Mongo) {
        super(_mongo, 'blog');
    }
}