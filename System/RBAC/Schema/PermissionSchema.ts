import { HTTP } from 'System/Enum/HTTP';
import { IDocument } from 'System/Interface';

export interface Permission extends IDocument {
    route: {
        path: string;
        method: string;
    };
    description?: string;
    roles: string[];
}

export const PermissionSearchField = [
    'route.path',
    'route.method',
    'description',
    'roles'
]

export const PermisisonSchema = {
    route: {
        type: {
            path: {
                type: String,
                required: true,
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
    description: {
        type: String
    },
    roles: {
        type: [String]
    }
}