import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { KolUser } from 'Database/Schema/KolUserSchema';

// BASIC INFO
interface IKolEvalute {String
    readonly fb: {
        readonly frequeString
        readonly contenString
        readonly style:String
    };
    readonly text: {
        readonly length: number;
        readonly interactivity: number;
        readonly swearing_happy: number;
    };
    readonly image: {
        readonly personal_style: Array<number>;
        readonly content: Array<number>;
        readonly scenery: number;
        readonly refine_content: number;
    };
    readonly general_style: {
        readonly appearence: number;
        readonly brand: number;
    };
}
interface IKolBasicInfo {
    readonly mobile: string;
    readonly sex: number;
    readonly dob: number;
    readonly matrimony: number;
    readonly num_child: number;
    readonly job: Array<number>;
    readonly job_other: Array<number>;
    readonly share_story: Array<number>;
    readonly share_story_other: Array<number>;
    readonly price: {
        readonly photo: number;
        readonly livestream: number;
        readonly have_video: number;
        readonly share_link: number;
    };
    readonly notification_job: boolean;
    readonly step: string;
    readonly reject_note: {
        readonly reason_id: string;
        readonly description: string;
    };
    readonly evaluate: IKolEvalute;
    readonly history_action: Array<{readonly causer_id: string, readonly type: number}>;
}

// FACEBOOK

interface IFacebookPage {
    readonly access_token: string;
    readonly category: string;
    readonly category_list: Array<{ readonly id: string; readonly name: string }>;
    readonly name: string;
    readonly id: string;
    readonly task: Array<string>;
}

interface IFacebookAnalytic {
    readonly total_follower: number;
    readonly total_post_last_3_month: number;
    readonly avg_reaction_last_3_month: number;
    readonly avg_comment_last_3_month: number;
    readonly avg_sharing_last_3_month: number;
    readonly avg_engagement_last_3_month: number;
}

interface IKolFacebookInfo {
    readonly entity_id: string;
    readonly app_scoped_id: string;
    readonly app_scoped_token: string;
    readonly name: string;
    readonly profile_link: string;
    readonly pages: Array<IFacebookPage>;
    readonly analytic: IFacebookAnalytic;
}

// KOL INFO
interface IKolUser {
    readonly email: string;
    readonly code: string;
    readonly password: string;
    readonly setting: object;
    readonly status: string;
    readonly facebook: IKolFacebookInfo;
    readonly kol_info: IKolBasicInfo;
    readonly summary_info: string;
    readonly verify_email: object;
    readonly verify_password: object;
    readonly product_tour: number;
    readonly invites: object;
    readonly joins: object;
    readonly num_rate: number;
    readonly num_rate_evaluate: number;
    readonly income: object;
    readonly payment_info: object;
    readonly delivery_info: object;
}

export { IKolUser, IKolBasicInfo, IKolFacebookInfo, IKolEvalute };

export enum KolInfoStatus {
    Raw = 0,
    Verified = 1,
    Rejected = 2
};

export enum KolStatus {
    Enable = 1,
    Disable = 0
}

export enum HistoryActionType {
    Status = 1,
    Mail = 2
}

@Injectable
export class KolUserModel extends BaseModel<IKolUser, KolUser> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'kol_user');
    }
}
