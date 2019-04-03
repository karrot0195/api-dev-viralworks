import { IDocument } from 'System/Interface';

export interface Mail extends IDocument {
    readonly message_id: string,
    readonly email: string,
    readonly events: Array<string>,
    readonly event_latest: string,
    readonly status: number
}

export const MailSchema = {
    message_id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    events: {
        type: Array,
        default: []
    },
    event_latest: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    }
};
