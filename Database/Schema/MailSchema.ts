import { IDocument } from 'System/Interface';

interface MailEvent {
    readonly event: string;
    readonly timestamp: number;
}

export interface Mail extends IDocument {
    message_id: string;
    mail_type: number;
    readonly email: string;
    readonly events: Array<MailEvent>;
    readonly event_latest: string;
    status: number;
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
    message_id: String,
    mail_type: Number,
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
