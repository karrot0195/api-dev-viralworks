import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';

export interface HistoryAction extends IDocument {
    causer_id?: string | object;
    kol_id: string;
    kol_status: number;
    type: number;
    ref_id: string;
    reason: string;
    kol_state: number;
}

export const HistorySchema = {
    causer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    kol_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'kol_user'
    },
    kol_status: {
        type: Number
    },
    type: {
        type: Number
    },
    ref_id: {
        type: String,
        default: null
    },
    reason: {
        type: String
    },
    kol_state: {
        type: Number
    }
};
