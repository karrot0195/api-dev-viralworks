import { IDocument } from 'System/Interface';

export interface CategoryBlog extends IDocument {
    readonly name: String;
    readonly slug: String;
}

export const CategoryBlogSchema = {
    name: String,
    slug: String
};
