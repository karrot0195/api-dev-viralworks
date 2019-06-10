import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface Package extends IDocument {
    name: string;
    description: string;
    package_price: number;
    post_type: string;
    occupations: any[];
    topics: any[];
    male_percent: string;
    location: string;
    age_average: string;
    groups:
        | {
              price: number;
              tag: number;
              kols: [string];
          }[]
        | any;
    cover_url: string;
    stats?: any;
    is_public: boolean;
    show_dashboard: boolean;
    is_instant: boolean;
    slug: string;
    display_stats: {
        total_post: number;
        total_follower: number;
        total_average_engagement: number;
        location: string;
    };
}

export const PackageSearchField = ['name', 'description', 'topic', 'location'];

export const PackageSchema = {
    name: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String
    },
    package_price: {
        type: Number,
        require: true
    },
    post_type: {
        type: Number,
        require: true
    },
    occupations: {
        type: Array,
        require: true
    },
    topics: {
        type: Array,
        require: true
    },
    male_percent: {
        type: String,
        require: true
    },
    location: {
        type: String,
        require: true
    },
    age_average: {
        type: String,
        require: true
    },
    groups: {
        type: [
            {
                price: {
                    type: Number,
                    require: true
                },
                tag: {
                    type: Number,
                    require: true
                },
                kols: {
                    type: [{ type: Schema.Types.ObjectId, ref: 'kol_user' }]
                }
            }
        ]
    },
    cover_url: {
        type: String
    },
    stats: {
        type: Object
    },
    is_public: {
        type: Boolean
    },
    show_dashboard: {
        type: Boolean
    },
    is_instant: {
        type: Boolean
    },
    slug: {
        type: String,
        require: true,
        unique: true
    },
    display_stats: {
        type: {
            total_post: { type: Number },
            total_follower: { type: Number },
            total_average_engagement: { type: Number },
            location: { type: String }
        }
    }
};
