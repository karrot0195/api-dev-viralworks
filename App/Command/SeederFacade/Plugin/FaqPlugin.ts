import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";

export class FaqPlugin implements IPluginSeeder {
    name: string = 'faq';
    description: string = 'Seeder data for faq';
    async excute(context: SeederCommand) {
        if (await context._faqModel.find().count())  context._faqModel.dropCollection();
        const FaqModel = context.mappingModel['faqs'];
        const data = await FaqModel.find();
        const result = await context._faqModel.insertMany(data);
        console.log('\x1b[31m', `created category blog: ${result.length}`, '\x1b[0m');
    }
}