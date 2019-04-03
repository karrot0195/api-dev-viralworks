import { IDocument } from 'System/Interface';

interface MailEvent {
    readonly event: string,
    readonly timestamp: number
}

export interface Mail extends IDocument {
    readonly message_id: string,
    readonly email: string,
    readonly events: Array<MailEvent>,
    readonly event_latest: string,
    readonly status: number
}

const EventMailSchema = {
    event: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    }
};

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
        type: [EventMailSchema],
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
