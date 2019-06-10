import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";
import { IShareStory } from "App/Models/CategoryShareStoryModel";
import { ICategoryShareStory } from "App/Models/CategoryShareStoryModel";

export class CategoryShareStoryPlugin implements IPluginSeeder {
    name: string = 'category-share-story';
    description: string = 'Seeder data for category share story';
    async excute(context: SeederCommand) {
        if (await context._catShareStoryModel.find().count())  context._catShareStoryModel.dropCollection();

        const CatShareStoryModel = context.mappingModel['category_share_stories'];
        const ShareStoryModel = context.mappingModel['share_stories'];
        const cats = await CatShareStoryModel.find();

        const data: Array<object> = [];
        for (const cat of cats) {
            const arr: Array<object> = [];
            const shareStories = await ShareStoryModel.find({ category_id: cat._id });

            for (const shareStory of shareStories) {
                arr.push(<IShareStory>{ name: shareStory.name, _id: shareStory._id, static_id: shareStory.static_id });
            }

            data.push({
                name: cat.name,
                share_stories: <IShareStory[]>arr
            });
        }
        const result = await context._catShareStoryModel.insertMany(<ICategoryShareStory[]>data);
        console.log('\x1b[31m', `created category share story: ${result.length}`, '\x1b[0m');
    }
}
