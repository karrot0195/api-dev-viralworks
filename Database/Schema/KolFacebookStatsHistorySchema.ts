import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface KolFacebookStatsHistory extends IDocument {
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

export const KolFacebookStatsHistorySchema = {
    kol_id: {
        type: Schema.Types.ObjectId,
        ref: 'kol_user',
        required: true
    },
    analytic: {
        total_follower: {
            type: Number
        },
        total_post_last_3_month: {
            type: Number
        },
        avg_reaction_last_3_month: {
            type: Number
        },
        avg_comment_last_3_month: {
            type: Number
        },
        avg_sharing_last_3_month: {
            type: Number
        },
        avg_engagement_last_3_month: {
            type: Number
        },
        latest_updated: {
            type: Date
        }
    }
};
