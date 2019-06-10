import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';
import {
    FacebookSchemaItem,
    KolInfoSchemaItem,
    TokenSchemaItem,
    IncomeSchemaItem,
    PaymentSchemaItem,
    DeliverySchemaItem
} from 'App/Constants/Schema/KolUser/KolUserSchemaItem';
import { HistoryAction } from './HistoryActionSchema';
import { model, Model } from 'mongoose';
import { HistoryActionType } from 'App/Models/HistoryActionModel';

/* Kol User */
interface KolUser extends IDocument {
    email: string;
    code: string;
    password: string;
    setting: object;
    status: number;
    facebook: object;
    kol_info: object;
    summary_info: string;
    verify_email: object;
    verify_password: object;
    product_tour: number;
    income: {
        pending: number;
        approved: number;
    };
    payment_info: object;
    delivery_info: object;
    histories: Array<string | HistoryAction>;
    location: string;
    token: {
        email: object;
        password: object;
    };
    job: any;
    rate: {
        evaluate: {
            count: number;
        };
        num: number;
    };
}
/**/

const KolUserSchema = {
    histories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'history_action' }],
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    setting: {
        receive_newsletter: {
            type: Boolean
        }
    },
    status: {
        type: Number,
        default: 1
    },
    facebook: FacebookSchemaItem,
    kol_info: KolInfoSchemaItem,
    summary_info: {
        type: String
    },
    token: {
        email: TokenSchemaItem,
        password: TokenSchemaItem
    },
    verify: {
        email: {
            type: Boolean,
            default: false
        }
    },
    product_tour: {
        type: Boolean,
        default: false
    },
    rate: {
        num: {
            type: Number,
            default: 0
        },
        evaluate: {
            count: {
                type: Number,
                default: 0
            }
        }
    },
    income: IncomeSchemaItem,
    payment_info: PaymentSchemaItem,
    delivery_info: DeliverySchemaItem,
    job: {
        invite: {
            count: {
                type: Number,
                default: 0
            }
        },
        running: {
            count: {
                type: Number,
                default: 0
            }
        },
        completed: {
            count: {
                type: Number,
                default: 0
            }
        }
    },
    location: String
};

export const OptionKolUserSchema = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

export function FuncKolUserCustomSchema(schema: mongoose.Schema, models: Model<any>) {
    let virtualJob = schema.virtual('kol_info.cat_jobs');
    let virtualShareStories = schema.virtual('kol_info.cat_share_stories');
    virtualJob.get(async function() {
        const jobs = this.kol_info.job;
        const arr: Array<any> = [];
        if (jobs) {
            const data = await models['category_job'].find({
                'jobs._id': { $in: this.kol_info.job }
            });
            if (data && data.length) {
                for (const catJob of data) {
                    for (const job of catJob['jobs']) {
                        if (jobs.find(j => j == job._id.toString())) {
                            arr.push(job);
                        }
                    }
                }
            }
        }
        return arr;
    });

    virtualShareStories.get(async function() {
        const share_stories = this.kol_info.share_story;
        const arr: Array<any> = [];
        if (share_stories) {
            const data = await models['category_share_story'].find({
                'share_stories._id': { $in: share_stories }
            });
            if (data && data.length) {
                for (const catJob of data) {
                    for (const shareStory of catJob['share_stories']) {
                        if (share_stories.find(s => s == shareStory._id.toString())) {
                            arr.push(shareStory);
                        }
                    }
                }
            }
        }
        return arr;
    });
}

const KolSearchField = ['email', 'code', 'summary', 'facebook.name', 'facebook.enitiy_id'];

export { KolUser, KolUserSchema, KolSearchField };
