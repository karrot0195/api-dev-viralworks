import { HTTP } from 'System/Enum/HTTP';
import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface Permission extends IDocument {
    route: {
        path: string;
        method: string;
    };
    name?: string;
    roles: string[];
}

export const PermissionSearchField = ['route.path', 'route.method', 'name'];

export const PermisisonSchema = {
    route: {
        type: {
            path: {
                type: String,
                required: true
            },
            method: {
                type: String,
                enum: [HTTP.Get, HTTP.Post, HTTP.Put, HTTP.Delete],
                required: true
            }
        },
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    roles: {
        type: [{ type: Schema.Types.ObjectId, ref: 'role' }]
    }
};
