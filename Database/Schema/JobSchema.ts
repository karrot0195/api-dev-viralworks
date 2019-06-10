import { IDocument } from 'System/Interface';
import { QuestionItem, TimeItem, GroupItem } from 'App/Constants/Schema/Job/JobItem';
import * as mongoose from 'mongoose';
import { JobInvite } from './JobInviteSchema';
import { KolJob } from './KolJobSchema';
const Schema = mongoose.Schema;

export enum JobHistoryAction {
    Invite = 1,
    RejectInvite = 2,
    ReInviteKol = 3,
    FinishJob = 4
}

export enum KolHistoryType {
    Add = 1,
    Remove = 2,
    Invite = 3,
    AcceptInvite = 4,
    RejectInvite = 5,
    Reinvite = 6
}

/* Interface */
export interface Job extends IDocument {
    cover_image: boolean;
    title: string;
    description: string;
    assign_brand: string;
    type: number;
    sharelink: string;
    hashtags: Array<string>;
    social: number;
    special_requirement: string;
    sample_post: boolean;
    thing_avoid: string;
    content_requirement: string;
    questions: Array<QuestionItem>;
    time: Array<TimeItem>;
    groups: Array<GroupItem>;
    status: number;
    manager_by: string;
    invites: Array<string | JobInvite>;
    kol_jobs: Array<string | KolJob>;
    kpi: {
        post: number;
        buzz: number;
        engagement: number;
    };
    groups_reference: string;
    statistic: {
        post: {
            approved_content: number;
            approved_link: number;
            completed: number;
        };
        engagement: {
            total_reaction: number;
            total_share: number;
            total_comment: number;
            total_like: number;
            total_follower: number;
        };
        post_time: Array<object>;
        location: Array<object>;
        job: Array<object>,
        share_story: Array<object>,
        kol: {
            follower: number,
            share: number,
            comment: number,
            reaction: number,
            engagement: number
        }
    };
    histories: Array<{
        type: number;
        job_status: number;
        time: Date;
        data?: any;
        causer_id?: string | object;
    }>;
    kol_histories: Array<{
        kol_id: string | object,
        histories: Array<{
            type: number,
            time: Date,
            causer_id?: string | object
        }>
    }>;
    reason_complete: string
}
/**/

/* Schema */
export const JobSchema = {
    cover_image: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: Number,
        default: 1 // Raw status
    },
    description: String,
    assign_brand: { type: Schema.Types.ObjectId, ref: 'brand' },
    type: Number,
    sharelink: String,
    hashtags: [{ type: String }],
    social: Number,
    special_requirement: String,
    sample_post: {
        type: Boolean,
        default: false
    },
    thing_avoid: String,
    content_requirement: String,
    questions: [{ question: String, answer1: String, answer2: String, answer3: String, choose: Number }],
    time: [{ limit: Number, time: Date }],
    groups: [
        { tag: Number, price: Number, kols: [{ type: Schema.Types.ObjectId, ref: 'kol_user' }], static_id: Number }
    ],
    manager_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    invites: [{ type: Schema.Types.ObjectId, ref: 'job_invite' }],
    kol_jobs: [{ type: Schema.Types.ObjectId, ref: 'kol_job' }],
    kpi: {
        post: Number,
        buzz: Number,
        engagement: Number
    },
    groups_reference: {
        type: Schema.Types.ObjectId,
        ref: 'kol_package'
    },

    statistic: {
        post: {
            approved_content: {
                type: Schema.Types.Number,
                default: 0
            },
            approved_link: {
                type: Schema.Types.Number,
                default: 0
            },
            completed: {
                type: Schema.Types.Number,
                default: 0
            }
        },
        engagement: {
            total_reaction: {
                type: Number,
                default: 0
            },
            total_share: {
                type: Number,
                default: 0
            },
            total_comment: {
                type: Number,
                default: 0
            },
            total_like: {
                type: Number,
                default: 0
            }
        },
        kol: {
            follower: {
                type: Number,
                default: 0
            },
            reaction: {
                type: Number,
                default: 0
            },
            share: {
                type: Number,
                default: 0
            },
            comment: {
                type: Number,
                default: 0
            },
            engagement: {
                type: Number,
                default: 0
            }
        },
        post_time: [{ id: Schema.Types.String, count: Schema.Types.Number }],
        location: [{ id: Schema.Types.String, count: Schema.Types.Number }],
        job: [ {id: Schema.Types.String, count: Schema.Types.Number, name: String } ],
        share_story: [ {id: Schema.Types.String, count: Schema.Types.Number, name: String } ]
    },
    histories: [
        {
            type: {
                type: Number
            },
            job_status: Number,
            time: {
                type: Date,
                default: new Date()
            },
            causer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
        }
    ],
    kol_histories: [
        {
            kol_id: {
                type: Schema.Types.ObjectId,
                ref: 'kol_user'
            },
            histories: [
                {
                    time: {
                        type: Date,
                        default: new Date()
                    },
                    type: {
                        type: Number
                    },
                    causer_id: {
                        type: Schema.Types.ObjectId,
                        ref: 'user'
                    }
                }
            ]
        }
    ],
    reason_complete: {
        type: String
    }
};
/**/
