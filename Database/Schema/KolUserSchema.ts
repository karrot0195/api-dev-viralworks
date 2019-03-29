import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';

interface HistoryActionItem {
    readonly causer_id: string, 
    readonly type: number
}

interface KolUser extends IDocument {
    readonly email: string;
    readonly code: string;
    readonly password: string;
    readonly setting: object;
    readonly status: string;
    readonly facebook: object;
    readonly kol_info: object;
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
    readonly delivery_info: object
}

const HistoryActionItemSchema =  {
    causer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    kol_status: {
        type: Number
    },
    created_at: {
        type: Date,
        default: new Date()
    }
}

const PaymentSchema = {
    account_name: {
        type: String,
    },
    account_id: {
        type: String,
    },
    bank_name: {
        type: String,
    },
    bank_province: {
        type: String,
    },
    bank_branch: {
        type: String,
    },
};

const FacebookSchema = {
    entity_id: {
        type: String,
    },
    name: {
        type: String,
    },
    profile_link: {
        type: String,
    },
    app_scoped_id: {
        type: String,
    },
    app_scoped_token: {
        type: String,
    },
    page: {
        type: Array,
    },
    analytic: {
        total_follower: {
            type: Number,
        },
        total_post_last_3_month: {
            type: Number,
        },
        avg_reaction_last_3_month: {
            type: Number,
        },
        avg_comment_last_3_month: {
            type: Number,
        },
        avg_sharing_last_3_month: {
            type: Number,
        },
        avg_engagement_last_3_month: {
            type: Number,
        },
        latest_updated: {
            type: Date,
        },
    },
};

const EvaluateSchema = {
    fb: {
        frequency: {
            type: Number,
        },
        style: {
            type: Number,
        },
        content: {
            type: Array,
        },
    },
    text: {
        length: {
            type: Number,
        },
        interactivity: {
            type: Number,
        },
        swearing_happy: {
            type: Number,
        },
    },
    image: {
        content: {
            type: Array,
        },
        personal_style: {
            type: Array,
        },
        scenery: {
            type: Number,
        },
        refine_content: {
            type: Number,
        },
    },
    general_style: {
        appearence: {
            type: Number,
        },
        brand: {
            type: Number,
        },
    },
};

const PriceSchema = {
    photo: {
        type: Number,
    },
    livestream: {
        type: Number,
    },
    have_video: {
        type: Number,
    },
    share_link: {
        type: Number,
    },
};

const KolInfoSchema = {
    mobile: {
        type: String,
    },
    sex: {
        type: Number,
    },
    dob: {
        type: Number,
    },
    matrimony: {
        type: Number,
    },
    num_child: {
        type: Number,
    },
    job: {
        type: Array,
    },
    job_other: {
        type: Array,
    },
    share_story: {
        type: Array,
    },
    share_story_other: {
        type: Array,
    },
    price: PriceSchema,
    notification_job: {
        type: Boolean,
    },
    step: {
        type: String,
    },
    status: {
        type: Number,
        default: 0,
    },
    reject_note: {
        reason_id: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    evaluate: EvaluateSchema,
    history_action: [HistoryActionItemSchema]
};

const TokenSchema = {
    token: {
        type: String,
    },
    status: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
};

const IncomeSchema = {
    pending: {
        type: Number,
        default: 0,
        min: 0,
    },
    approved: {
        type: Number,
        default: 0,
        min: 0,
    },
};

const DeliverySchema = {
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    address: {
        type: String,
    },
};

const KolUserSchema = {
    email: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    setting: {
        receive_newsletter: {
            type: Boolean,
        },
    },
    status: {
        type: Number,
        default: 1,
    },
    facebook: FacebookSchema,
    kol_info: KolInfoSchema,
    summary_info: {
        type: String,
    },
    verify_email: TokenSchema,
    verify_password: TokenSchema,
    product_tour: {
        type: Number,
    },
    invites: {
        type: Array,
    },
    joins: {
        type: Array,
    },
    num_rate: {
        type: Number,
    },
    num_rate_evaluate: {
        type: Number,
    },
    income: IncomeSchema,
    payment_info: PaymentSchema,
    delivery_info: DeliverySchema,
};

export { KolUser, KolUserSchema };
