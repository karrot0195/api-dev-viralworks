import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";

export class BlogPlugin implements IPluginSeeder {
    name: string = 'blog';
    description: string = 'Seeder data for blog';
    async excute(context: SeederCommand) {
        await this.addCategoryBlog(context);
        // await this.addBlog(context);
    }

    private async addCategoryBlog(context: SeederCommand) {
        if (await context._catBlogModel.find().count())  context._catBlogModel.dropCollection();
        const CategoryBlogModel = context.mappingModel['category_blogs'];
        const data = await CategoryBlogModel.find();
        const result = await context._catBlogModel.insertMany(data);
        console.log('\x1b[31m', `created category blog: ${result.length}`, '\x1b[0m');
    }

    private async addBlog(context: SeederCommand) {
        if (await context._blogModel.find().count())  context._blogModel.dropCollection();
        const BlogModel = context.mappingModel['blogs'];
        const data = await BlogModel.find();
        const result = await context._blogModel.insertMany(data);
        console.log('\x1b[31m', `created blog: ${result.length}`, '\x1b[0m');
    }
}