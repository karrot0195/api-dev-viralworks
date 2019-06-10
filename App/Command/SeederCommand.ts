import { ICommand } from 'System/Interface';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import * as mongoose from 'mongoose';
import { CategoryReasonModel } from 'App/Models/CategoryReasonModel';
import { CategoryJobModel } from 'App/Models/CategoryJobsModel';
import { CategoryShareStoryModel } from 'App/Models/CategoryShareStoryModel';
import { KolUserModel } from 'App/Models/KolUserModel';
import * as readline from 'readline';
import { BlogModel } from 'App/Models/BlogModle';
import { CategoryBlogModel } from 'App/Models/CategoryBlogModel';
import { FaqModel } from 'App/Models/FaqModel';
import { SuggestKolPriceModel } from 'App/Models/SuggestKolPriceModel';
import { ProvinceModel } from 'App/Models/ProvinceModel';
import { ModelSchema } from './SeederFacade/Schema';
import { IPluginSeeder } from './SeederFacade/Interface';
import { registerSeederPlugin } from './SeederFacade/Helpers';
import { BankModel } from 'App/Models/BankModel';

@Injectable
export class SeederCommand implements ICommand {
    public mappingModel: object;
    public rl: readline.ReadLine;
    public mSource;
    public pSource =
        'mongo mongodb://test_admin:ViralWork%402018%21%40%23@206.189.155.105:27017/main_vw_v2?authSource=admin';

    static mappingFunc: Array<IPluginSeeder> = [];
    constructor(
        private _mongo: Mongo,
        public _catReasonModel: CategoryReasonModel,
        public _catJobModel: CategoryJobModel,
        public _catShareStoryModel: CategoryShareStoryModel,
        public _kolUserModel: KolUserModel,
        public _blogModel: BlogModel,
        public _catBlogModel: CategoryBlogModel,
        public _faqModel: FaqModel,
        public _suggestKolPriceModel: SuggestKolPriceModel,
        public _provinceModel: ProvinceModel,
        public _bankModel: BankModel
    ) {
        const transactionTables = ['request_payments', 'job_invites', 'kol_jobs', 'history_actions'];
        for (const table of transactionTables) {
            _mongo._mongodb.createCollection(table);
        }
        registerSeederPlugin();
    }

    public async run() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        await this.connectMongoSource();
        await this.mappingModelSource();
        await this.excuteAction();
        return 'success';
    }

    static registerPlugin(plugin: IPluginSeeder) {
        if (!SeederCommand.mappingFunc.find(_p => _p.name == plugin.name)) {
            SeederCommand.mappingFunc.push(plugin);
        }
    }

    private async excuteAction() {
        const action = await this.primaryMenu();
        if (action == 'all') {
            for (const plugin of SeederCommand.mappingFunc) {
                await plugin.excute(this);
            }
        } else {
            const idx = parseInt(action);
            let plugin: IPluginSeeder;
            if (isNaN(idx)) {
                plugin = <IPluginSeeder>SeederCommand.mappingFunc.find(p => p.name == action);
            } else {
                plugin = <IPluginSeeder>SeederCommand.mappingFunc[idx - 1];
            }

            if (plugin) {
                const checkOk = (): Promise<boolean> => {
                    return new Promise(res => {
                        this.rl.question(
                            `\x1b[41m \x1b[37m My action will drop related collection! Are you sure? (ok): \x1b[0m`,
                            answer => {
                                if (answer == '' || answer == 'ok') {
                                    res(true);
                                }
                                res(false);
                            }
                        );
                    });
                };
                if (await checkOk()) {
                    await plugin.excute(this);
                }
            }
        }

        return await this.excuteAction();
    }

    private async connectMongoSource() {
        this.pSource = await this.takeMongoConection();
        this.mSource = await mongoose.createConnection(this.pSource, { useNewUrlParser: true });
    }

    private async takeMongoConection(): Promise<string> {
        return new Promise(resolve => {
            this.rl.question('Enter mongo connection: ', mongoConnection => {
                if (mongoConnection.length > 0) {
                    this.pSource = mongoConnection;
                } else {
                    console.log('Use mongo connection default: ' + this.pSource);
                    mongoConnection = this.pSource;
                }
                resolve(mongoConnection);
            });
        });
    }

    private async mappingModelSource() {
        const mapping: object = {};
        Object.keys(ModelSchema).forEach(k => {
            mapping[k] = this.mSource.model(k, new mongoose.Schema(ModelSchema[k]));
        });
        this.mappingModel = mapping;
    }

    private async primaryMenu(): Promise<string> {
        return new Promise(resolve => {
            var menuText = `\n [MENU ACITON] \n`;

            SeederCommand.mappingFunc.forEach((p, i) => {
                menuText += `${i + 1}. [${p.name}] ${p.description} \n`;
            });
            menuText += `Please press key: (all action with key "all")`;
            console.log('\x1b[32m', menuText, '\x1b[0m');
            this.rl.question('Enter action: ', action => {
                resolve(action);
            });
        });
    }
}
