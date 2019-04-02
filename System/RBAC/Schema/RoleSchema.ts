import { IDocument } from 'System/Interface';

export interface Role extends IDocument {
    name: string;
    description?: string;
    parents: string[];
    permissions: string[];
}

export const RoleSearchField = ['name', 'description', 'parents', 'permissions'];

export const RoleSchema = {
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    parents: {
        type: [String]
    },
    permissions: {
        type: [String]
    }
};
