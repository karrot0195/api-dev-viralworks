import { Schema } from "mongoose";

export const ModelSchema = {
    category_reasons: { name: String },
    category_jobs: { name: String },
    category_share_stories: { name: String },
    jobs: { name: String, category_id: String, static_id: Number },
    share_stories: { name: String, category_id: String, static_id: Number },
    reasons: { name: String, category_id: String },
    kol_users: {
        facebook: Object,
        kol_info: Object,
        verify_email: Object,
        verify_password: Object,
        income: Object,
        status: Number,
        invites: Array,
        joins: Array,
        email: String,
        password: String,
        code: String,
        summary_info: String,
        product_tour: Number,
        num_rate: Number,
        num_rate_evaluate: Number
    },
    kol_infos: { email: String, kol_evaluate: Object },
    blogs: {
        title: String,
        content: String,
        categories: [{ type: String }],
        base_title: String,
        status: Number,
        exceprt: String,
        thumbnail: String,
        source: String,
        updated_at: Date,
        created_at: Date,
        keywords: [{ type: String }],
        image_cover: String,
        date_published: Number,
        exceprt_number_limit: Number,
        thumbnail_alt: String,
        image_cover_alt: String,
        main_post: Number
    },
    category_blogs: {
        name: String,
        slug: String
    },
    faqs: {
        question: String,
        answer: String,
        status: Number,
        type: Number
    },
    suggest_kol_prices: {
        follower: [{ type: Schema.Types.Number }],
        sharelink: [{ type: Schema.Types.Number }],
        repost: [{ type: Schema.Types.Number }],
        photo: [{ type: Schema.Types.Number }],
        livestream: [{ type: Schema.Types.Number }]
    },
    cities: {
        country: String,
        code: String,
        name: String
    },
    banks: {
        name: String,
        provinces: Object
    }
};