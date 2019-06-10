export interface IFacebookPageItem {
    readonly access_token: string;
    readonly category: string;
    readonly category_list: Array<{ readonly id: string; readonly name: string }>;
    readonly name: string;
    readonly id: string;
    readonly task: Array<string>;
}

interface IFacebookAnalyticItem {
    readonly total_follower: number;
    readonly total_post_last_3_month: number;
    readonly avg_reaction_last_3_month: number;
    readonly avg_comment_last_3_month: number;
    readonly avg_sharing_last_3_month: number;
    readonly avg_engagement_last_3_month: number;
}

/* IKolEvalute */
interface IKolEvaluteItem {
    readonly fb: {
        readonly frequency: number;
        readonly content: number;
        readonly style: number;
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
/**/

/* IKolBasicInfoItem */
export interface IKolPrice {
    readonly photo: number;
    readonly livestream: number;
    readonly have_video: number;
    readonly share_link: number;
}

interface IKolBasicInfoItem {
    readonly mobile: string;
    readonly sex: number;
    readonly dob: number;
    readonly matrimony: number;
    readonly num_child: number;
    readonly job: Array<string>;
    readonly job_other: Array<string>;
    readonly share_story: Array<string>;
    readonly share_story_other: Array<string>;
    readonly price: IKolPrice;
    readonly notification_job: boolean;
    readonly step: number;
    readonly status: number;
    readonly evaluate: IKolEvaluteItem;
}
/**/

/* IKolFacebookInfo */
interface IKolFacebookInfoItem {
    readonly entity_id: string;
    readonly app_scoped_id: string;
    readonly app_scoped_token: string;
    readonly name: string;
    readonly profile_link: string;
    readonly pages: Array<IFacebookPageItem>;
    readonly analytic: IFacebookAnalyticItem;
}
/**/

export { IKolBasicInfoItem, IKolFacebookInfoItem, IKolEvaluteItem };
