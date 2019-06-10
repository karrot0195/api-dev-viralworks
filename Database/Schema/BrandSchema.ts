import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface Brand extends IDocument {
    name: string;
    email: string;
    password: string;
    reset_password: IResetPassword;
    phone: string;
    is_disabled: boolean;
    avatar_url?: string;
    bookmark_packages: string[];
}

export interface IResetPassword {
    token: string;
    status: number;
}

export const BrandSearchField = ['name', 'email'];

export const BrandSchema = {
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    reset_password: {
        type: {
            token: {
                type: String
            },
            status: {
                type: Number
            }
        },
        select: false
    },
    phone: {
        type: String,
        required: true
    },
    is_disabled: {
        type: Boolean,
        required: true
    },
    avatar_url: {
        type: String
    },
    bookmark_packages: {
        type: [{ type: Schema.Types.ObjectId, ref: 'kol_package' }]
    }
};
