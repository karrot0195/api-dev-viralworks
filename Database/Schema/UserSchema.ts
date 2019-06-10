import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface User extends IDocument {
    name: string;
    email: string;
    password: string;
    roles: string[];
    code: string;
    is_disabled: boolean;
    avatar_url?: string;
}

export const UserSearchField = ['name', 'email', 'code'];

export const UserSchema = {
    name: {
        type: String,
        required: true
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
    roles: {
        type: [{ type: Schema.Types.ObjectId, ref: 'role' }],
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    is_disabled: {
        type: Boolean,
        required: true
    },
    avatar_url: {
        type: String
    }
};
