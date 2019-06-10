import { SeederCommand } from '../../SeederCommand';
import { IPluginSeeder } from '../Interface';
import { IBank } from 'App/Models/BankModel';

export class BankPlugin implements IPluginSeeder {
    name: string = 'bank';
    description: string = 'Seeder data for bank';
    async excute(context: SeederCommand) {
        await this.addBanks(context);
    }

    private async addBanks(context: SeederCommand) {
        if (await context._bankModel.find().count())  context._bankModel.dropCollection();

        const BankModel = context.mappingModel['banks'];
        const data: Array<IBank> = [];
        (await BankModel.find()).forEach(bank => {
            const item:any = {};
            item['name'] = bank.name;
            item['provinces'] = [];

            if (bank.provinces) {
                Object.keys(bank.provinces).forEach(key => {
                    item['provinces'] = { key: key, branch: bank.provinces[key] };
                });
            }
            data.push(item);
        });
        const result = await context._bankModel.insertMany(data);
        console.log('\x1b[31m', `created bank: ${result.length}`, '\x1b[0m');
    }
}
