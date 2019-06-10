import * as mongoose from "mongoose";

const PaymentSchemaItem = {
    account_name: {
        type: String
    },
    account_id: {
        type: String
    },
    bank_name: {
        type: String
    },
    bank_province: {
        type: String
    },
    bank_branch: {
        type: String
    }
};

const FacebookSchemaItem = {
    entity_id: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    profile_link: {
        type: String
    },
    app_scoped_id: {
        type: String
    },
    app_scoped_token: {
        type: String
    },
    page: {
        type: Array
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

const EvaluateSchemaItem = {
    fb: {
        frequency: {
            type: Number
        },
        style: {
            type: Number
        },
        content: {
            type: Array
        }
    },
    text: {
        length: {
            type: Number
        },
        interactivity: {
            type: Number
        },
        swearing_happy: {
            type: Number
        }
    },
    image: {
        content: {
            type: Array
        },
        personal_style: {
            type: Array
        },
        scenery: {
            type: Number
        },
        refine_content: {
            type: Number
        }
    },
    general_style: {
        appearence: {
            type: Number
        },
        brand: {
            type: Number
        }
    },
    province: String,
    country: String
};

const PriceSchemaItem = {
    photo: {
        type: Number
    },
    livestream: {
        type: Number
    },
    have_video: {
        type: Number
    },
    share_link: {
        type: Number
    }
};

const KolInfoSchemaItem = {
    mobile: {
        type: String
    },
    sex: {
        type: Number
    },
    dob: {
        type: Number
    },
    matrimony: {
        type: Number
    },
    num_child: {
        type: Number
    },
    job: [ {type: mongoose.Schema.Types.ObjectId} ],
    job_other: {
        type: Array
    },
    share_story: [ {type: mongoose.Schema.Types.ObjectId} ],
    share_story_other: {
        type: Array
    },
    price: PriceSchemaItem,
    notification_job: {
        type: Boolean
    },
    step: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    },
    evaluate: EvaluateSchemaItem
};

const TokenSchemaItem = {
    token: {
        type: String,
    },
    status: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
};

const IncomeSchemaItem = {
    pending: {
        type: Number,
        default: 0,
        min: 0
    },
    approved: {
        type: Number,
        default: 0,
        min: 0
    }
};

const DeliverySchemaItem = {
    city: {
        type: String
    },
    district: {
        type: String
    },
    address: {
        type: String
    }
};

export {
    IncomeSchemaItem,
    DeliverySchemaItem,
    EvaluateSchemaItem,
    FacebookSchemaItem,
    KolInfoSchemaItem,
    PaymentSchemaItem,
    PriceSchemaItem,
    TokenSchemaItem
};
