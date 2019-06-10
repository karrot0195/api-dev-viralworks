import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';
var Schema = mongoose.Schema;

export interface HistoryItem {
    causer_id?: string | object;
    time?: Date;
    type: number;
    job_status: number;
    job_post_status: number;
    ref_id?: string;
    reason?: string;
}

export interface KolJob extends IDocument {
    kol_id: string | object;
    job_id: string | object;
    status: number;
    histories: Array<HistoryItem>;
    engagement: {
        reaction: number;
        like: number;
        share: number;
        comment: number;
    };
    price: number;
    post: {
        content: string;
        link: string;
        id: string;
        status: number;
        attachments: number;
        request: number;
    };
    evaluate: {
        rating: number;
        comment: string;
        cheat: boolean;
    };
    time: string;
    note: Array<{
        description: string;
        causer_id: string | object;
        time: Date;
    }>;
    is_block: boolean
}

export enum HistoryFrom {
    Admin = 'user',
    kol = 'kol_user'
}

const HistoryItemSchema = {
    causer_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    time: {
        type: Schema.Types.Date,
        default: new Date()
    },
    type: {
        type: Number
    },
    job_status: Number,
    job_post_status: Number,
    ref_id: String,
    reason: String
};

export const KolJobSchema = {
    kol_id: {
        type: Schema.Types.ObjectId,
        ref: 'kol_user',
        required: true
    },
    job_id: {
        type: Schema.Types.ObjectId,
        ref: 'job',
        required: true
    },
    status: {
        type: Number,
        default: 1 // active
    },
    histories: {
        type: [HistoryItemSchema]
    },
    engagement: {
        reaction: {
            type: Number,
            default: 0
        },
        like: {
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
        }
    },
    price: {
        type: Number,
        required: true
    },
    post: {
        content: String,
        link: String,
        id: String,
        status: {
            type: Number,
            default: 1 // content
        },
        attachments: {
            type: Number,
            default: 0
        },
        request: {
            type: Number,
            default: 0
        }
    },
    evaluate: {
        rating: Number,
        comment: String,
        cheat: Boolean
    },
    time: String,
    note: [
        { description: String, causer_id: { type: Schema.Types.ObjectId, ref: 'user' }, time: Date }
    ],
    is_block: {
        type: Boolean,
        default: false
    }
};
