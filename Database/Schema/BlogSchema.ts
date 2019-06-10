import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';
import { CategoryBlog } from './CategoryBlogSchema';

export interface Blog extends IDocument {
    readonly title: string;
    readonly content: string;
    readonly categories: Array<string | CategoryBlog>;
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

export const BlogSchema = {
    title: String,
    content: String,
    categories: [{ type: Schema.Types.ObjectId, ref: 'category_blog' }],
    base_title: String,
    status: Number,
    excerpt: String,
    thumbnail: String,
    source: String,
    keywords: [{ type: String }],
    image_cover: String,
    date_published: Date,
    excerpt_num_limit: Number,
    thumbnail_alt: String,
    image_cover_alt: String,
    main_post: Boolean
};
