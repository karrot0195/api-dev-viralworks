import { IDocument } from 'System/Interface';
import { Schema } from 'mongoose';

export interface Role extends IDocument {
    name: string;
    description?: string;
    parents: string[];
    permissions: string[];
    parent_id?: string;
    inherited_permissions?: string[];
}

export const RoleSearchField = ['name', 'description'];

export const RoleBlacklist = ['Brand', 'Kol'];

export const RoleSchema = {
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    parents: {
        type: [{ type: Schema.Types.ObjectId, ref: 'role' }]
    },
    permissions: {
        type: [{ type: Schema.Types.ObjectId, ref: 'permission' }]
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'role'
    },
    inherited_permissions: {
        type: [{ type: Schema.Types.ObjectId, ref: 'permission' }]
    }
};
