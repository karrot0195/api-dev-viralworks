import { Schema } from 'mongoose';
import { IDocument } from 'System/Interface/Mongo';
import { RequestPaymentStatus } from 'App/Models/RequestPaymentModel';

const SchemaTypes = Schema.Types;

export interface RequestPayment extends IDocument {
    kol_id: string | object;
    status: number;
    reason?: string;
    price: number;
}

export const RequestPaymentSchema = {
    kol_id: {
        type: SchemaTypes.ObjectId,
        ref: 'kol_user'
    },
    status: {
        type: SchemaTypes.Number,
        default: RequestPaymentStatus.Raw
    },
    price: {
        type: Number,
        require: true
    },
    reason: {
        type: SchemaTypes.String
    }
};
