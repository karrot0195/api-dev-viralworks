import { IDocument } from 'System/Interface';

export interface User extends IDocument {
    name: string;
    email: string;
    password: string;
    role: string;
}

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
    }
}