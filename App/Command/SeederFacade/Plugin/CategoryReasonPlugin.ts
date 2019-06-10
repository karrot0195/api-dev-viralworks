import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";
import { IReason } from "App/Models/CategoryReasonModel";
import { ICategoryReason } from "App/Models/CategoryReasonModel";

export class CategoryReasonPlugin implements IPluginSeeder {
    name: string = 'category-reason';
    description: string = 'Seeder data for category reason';
    async excute(context: SeederCommand) {
        if (await context._catReasonModel.find().count())  context._catReasonModel.dropCollection();
        const CatReasonModel = context.mappingModel['category_reasons'];
        const ReasonModel = context.mappingModel['reasons'];
        const cats = await CatReasonModel.find();
        const data: Array<object> = [];
        for (const cat of cats) {
            const arr: Array<object> = [];
            const reasons = await ReasonModel.find({ category_id: cat._id });

            for (const reason of reasons) {
                arr.push(<IReason>{ name: reason.name, _id: reason._id });
            }

            data.push({
                name: cat.name,
                reasons: arr
            });
        }
        const result = await context._catReasonModel.insertMany(<ICategoryReason[]>data);
        console.log('\x1b[31m', `created category reason: ${result.length}`, '\x1b[0m');
    }
}
