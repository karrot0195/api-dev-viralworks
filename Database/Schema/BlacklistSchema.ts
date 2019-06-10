import { IDocument } from 'System/Interface';
import { BlacklistReason } from 'System/Enum/BlacklistReason';

export interface Blacklist extends IDocument {
    disabled_user: {
        id_string: string;
        reason: BlacklistReason;
    };
    issued_at: number;
    expired_at: number;
}

export const BlacklistSchema = {
    disabled_user: {
        type: {
            id_string: {
                type: String
            },
            reason: {
                type: Number
            }
        },
        unique: true,
        required: true
    },
    issued_at: {
        type: Number
    },
    expired_at: {
        type: Number
    }
};
