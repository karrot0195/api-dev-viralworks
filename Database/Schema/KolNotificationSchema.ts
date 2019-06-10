import { IDocument } from 'System/Interface/Mongo';
import { Schema } from 'mongoose';
import { NotificationStatus } from 'App/Modules/Notification/Enum/Default';

export interface Notification extends IDocument {
    receiver_id: string;
    sender_id: string;
    status: number;
    message: string;
    type: string;
    source: string;
}

export const NotificationSchema = {
    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'kol_user'
    },
    sender_id: {
        type: Schema.Types.ObjectId,
    },
    status: {
        type: Number,
        default: NotificationStatus.Raw
    },
    message: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    source: {
        type: String,
        require: true
    }
};