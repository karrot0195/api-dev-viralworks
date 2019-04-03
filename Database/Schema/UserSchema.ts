import { IDocument } from 'System/Interface';

export interface User extends IDocument {
    name: string;
    email: string;
    password: string;
    role: string;
    code: string;
    isDisabled: boolean;
}

export const UserSearchField = ['name', 'email', 'role', 'code'];

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
    role: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    isDisabled: {
        type: Boolean,
        required: true
    }
};
