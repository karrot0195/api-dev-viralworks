import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";

export class ProvincePlugin implements IPluginSeeder {
    name: string = 'province';
    description: string = 'Seeder data for province';
    async excute(context: SeederCommand) {
        if (await context._provinceModel.find().count())  context._provinceModel.dropCollection();

        const ProvinceModel = context.mappingModel['cities'];
        const data = await ProvinceModel.find();
        const result = await context._provinceModel.insertMany(data);
        console.log('\x1b[31m', `created blog: ${result.length}`, '\x1b[0m');
    }
}