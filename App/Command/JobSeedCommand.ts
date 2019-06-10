import { ICommand } from 'System/Interface/Command';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { IJob, JobModel } from 'App/Models/JobModel';
import { KolUserModel } from 'App/Models/KolUserModel';
import { NotFound } from 'System/Error/NotFound';
import { BrandModel } from 'App/Models/BrandModel';
import { Brand } from 'Database/Schema/BrandSchema';
import { JobInviteService } from 'App/Modules/Job/Services/JobInviteService';
import { UserModel } from 'App/Models/UserModel';
import { sleep } from 'System/Helpers/Misc';
import { JobInviteModel } from 'App/Models/JobInviteModel';
import { FileStorage } from 'System/FileStorage';
import * as path from "path";
import { Config } from 'System/Config';
import { KolJobModel } from 'App/Models/KolJobModel';
import * as _ from 'lodash';

@Injectable
export class JobSeedCommand implements ICommand {
    private _excludeIds: Array<number> = [];
    private maxJob: number;
    private isSend: boolean;
    constructor(
        private _mongo: Mongo,
        private userModel: UserModel,
        private inviteService: JobInviteService,
        private _jobModel: JobModel,
        private _kolModel: KolUserModel,
        private _kolJobModel: KolJobModel,
        private _brandModel: BrandModel,
        private _jobInvite: JobInviteModel,
        private _storage: FileStorage,
        private _config: Config
    ) {}
    run = async (data: Array<any>) => {
        const params = this.takeParams(data);
        await this.excute(params);
        return 'success';
    };

    public async excute(params: object) {
        let emailList: Array<string>= [];

        const emailSuper = 'super_admin@admin.com';
        if (params['email']) {
            emailList = params['email'].split(',');
        }

        this.maxJob = 10;
        if (params['number']) {
            this.maxJob = parseInt(params['number']);
        }

        this.isSend = false;
        if (params['is_send']) {
            this.isSend = params['is_send'];
        }

        const kols = await this._kolModel.find({ email: {$in: emailList} });
        const auth = await this.userModel.findOne({ email: emailSuper });
        if (!auth) throw new NotFound('AUTH_NOT_FOUND');
        // if (!kols || kols && kols.length == 0) throw new NotFound('KOL_NOT_FOUND');

        const assignBrands: Array<Brand> = await this._brandModel.find();
        var assignBrand = assignBrands && assignBrands.length > 0 ? assignBrands[0]._id : '';
        if (!assignBrand) throw new NotFound('BRAND_NOT_FOUND');

        const kIds = kols.reduce((arr: Array<string>, kol: any) => {
            arr.push(kol._id.toString());
            return arr;
        }, []);

        const kNames = kols.reduce((arr: Array<string>, kol: any) => {
            arr.push(_.get(kol, 'facebook.name'));
            return arr;
        }, []);

        for (const kol of kols) {
            await this._resetData(kol);
        }

        return await this._feedDate(kIds, kNames, auth, assignBrand);
    }

    private takeParams = (dataString: Array<string>) => {
        let data: object = {};
        dataString.forEach(v => {
            let arr = v.split('=');
            if (arr.length >= 2) {
                data[arr[0]] = arr[1];
            }
        });
        return data;
    };

    private async _feedDate(kIds, kNames, auth, assignBrand) {
        const sampleText =
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod↵tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,↵quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo↵consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse↵cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non↵proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        const jobIds: Array<string> = [];
        for (let i = 0; i < this.maxJob; i++) {
            const time1 = new Date(+new Date() + (i+1) * 86400000);
            const time2 = new Date(+new Date() + (i+2 ) * 86400000);
            const types = [1, 4];

            const prefixTile = `${time1.getDate()}/${time1.getMonth()+1}/${time1.getFullYear()}`;
            const slot = Math.floor(kIds.length/2) ? Math.floor(kIds.length/2) : 1;
            const result = await this._jobModel.create(<IJob>{
                title: `${this._generateTitle()} [${prefixTile}]`,
                assign_brand: assignBrand,
                questions: [
                    {
                        question: 'This is question first?',
                        answer1: 'answer 1',
                        answer2: 'answer 2',
                        answer3: 'answer 3',
                        choose: 1
                    },
                    {
                        question: 'This is question second?',
                        answer1: 'answer 1',
                        answer2: 'answer 2',
                        answer3: 'answer 3',
                        choose: 2
                    }
                ],
                type: types[Math.floor(Math.random()*2)],
                hashtags: [this._generateText(3), this._generateText(4)],
                time: [
                    {
                        limit: slot,
                        time: time1
                    },
                    {
                        limit: slot,
                        time: time2
                    }
                ],
                content_requirement: sampleText,
                description: sampleText,
                special_requirement: 'Trên 18 tuổi',
                thing_avoid: sampleText,
                kpi: {
                    post: 10,
                    buzz: 10,
                    engagement: 10
                },
                groups: [
                    {
                        tag: 1,
                        price: 300000,
                        kols: kIds
                    }
                ],
                sharelink: 'https://www.facebook.com/0194thanhhieu'
            });

            jobIds.push(result._id);
            try {
                const indx = (i % 3);
                const source =  path.join(this._config.storage.dir, `job/sample${indx+1}`);
                const target = path.join(this._config.storage.dir, `job/${result._id}`);
                this._storage.copyFolderRecursiveSync(source, target);
                result.cover_image = true;
                result.sample_post = true;
                result.save();

            } catch (e) { }


            // add attachment
        }

        console.log('send invite');

        if (auth && this.isSend) {
            for (const jId of jobIds) {
                sleep(1000);
                await this.inviteService.sendInvite(auth._id.toString(), jId.toString(), false);
            }
        }
        return jobIds;
    }

    private async _resetData(kol: any) {
        const kId = kol._id.toString();
        await this._jobModel.deleteMany({"groups.kols": kId});
        await this._jobInvite.deleteMany({kol_id: kId});
        await this._kolJobModel.deleteMany({kol_id: kId});
        kol.job.running.count = 0;
        kol.job.invite.count = 0;
        kol.job.completed.count = 0;
        kol.income.pending = 0;
        kol.income.approved = 0;
        await kol.save();
    }

    private _generateTitle() {
        const title = [
            'Protect Yourself',
            'Human Rights-Animal Rights',
            'Animal Rights & Experimentation',
            'Silent Victims',
            'Buy American',
            'Don’t Drink & Drive',
            'Why Not Smoke?',
            'Crisis in Our Schools',
            'Bosnia: We’re There to Help',
            'Feeling More Secure',
            'Dan Quayle Was Right',
            'Red with Meat or Chicken?',
            'Are We Equal?'
        ];
        let idx = -1;
        while (true) {
            idx = Math.floor(Math.random() * title.length);
            if (!this._excludeIds.find(i => i == idx)) {
                this._excludeIds.push(idx);
                break;
            }
        }
        return title[idx];
    }

    private _generateText(length: number = 3, prefix: string = '', suffix: string = '') {
        const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i=0; i<length; i++) {
            result += text[Math.floor(Math.random() * text.length)];
        }
        return `${prefix}${result}${suffix}`;
    }
}
