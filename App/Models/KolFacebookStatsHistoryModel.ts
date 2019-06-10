import { BaseModel } from 'System/BaseModel';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { KolFacebookStatsHistory } from 'Database/Schema/KolFacebookStatsHistorySchema';

export interface IKolFacebookStatsHistory {
    kol_id: string;
    analytic: {
        total_follower: number;
        total_post_last_3_month: number;
        avg_reaction_last_3_month: number;
        avg_comment_last_3_month: number;
        avg_sharing_last_3_month: number;
        avg_engagement_last_3_month: number;
        latest_updated: Date;
    };
}

@Injectable
export class KolFacebookStatsHistoryModel extends BaseModel<IKolFacebookStatsHistory, KolFacebookStatsHistory> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'kol_facebook_stats_history');
    }
}
