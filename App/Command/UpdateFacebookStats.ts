import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { KolFacebookStatsHistoryModel, IKolFacebookStatsHistory } from 'App/Models/KolFacebookStatsHistoryModel';
import { KolUserModel } from 'App/Models/KolUserModel';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { sleep } from 'System/Helpers/Misc';
import { KolManagerService } from 'App/Modules/Kol/Services/Admin/KolManagerService';
import { Mongo } from 'System/Mongo';

require('System/Helpers/Log');

@Injectable
export class UpdateFacebookStats implements ICommand {
    constructor(
        private readonly _mongo: Mongo,
        private readonly _kolModel: KolUserModel,
        private readonly _kolManageService: KolManagerService,
        private readonly _kolFbUpdateHistory: KolFacebookStatsHistoryModel
    ) {}

    public async run() {
        console.log('Updating facebook stats...');

        let kols = await this.getAllKols();

        if (kols) await this.updateStats(kols);

        console.log('Updating facebook stats... - DONE');

        return { UpdateFacebookStats: 1 };
    }

    async getAllKols(): Promise<any> {
        let kols = await this._kolModel.find().select('_id');

        console.log('Kols count:', kols.length || 0);

        return kols;
    }

    async updateStats(kols: KolUser[]) {
        console.log('Updating stats...');

        await this._mongo._mongodb.createCollection('kol_facebook_stats_histories');

        for await (const kol of kols) {
            await this._mongo.transaction(async session => {
                let data = await this._kolManageService.updateEngagement(kol.id, session);

                let historyData: IKolFacebookStatsHistory = {
                    kol_id: kol.id,
                    analytic: data
                };

                await this._kolFbUpdateHistory.create(historyData, session);
            });

            await sleep(1000);
        }
    }
}
