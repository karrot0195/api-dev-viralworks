import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";

export class SuggestKolPricePlugin implements IPluginSeeder {
    name: string = 'suggest-kol-price';
    description: string = 'Seeder data for suggest kol price';
    async excute(context: SeederCommand) {
        if (await context._suggestKolPriceModel.find().count())  context._suggestKolPriceModel.dropCollection();
        const SuggestKolPriceModel = context.mappingModel['suggest_kol_prices'];
        const data = await SuggestKolPriceModel.find();
        const result = await context._suggestKolPriceModel.insertMany(data);
        console.log('\x1b[31m', `created suggest kol price: ${result.length}`, '\x1b[0m');
    }
}