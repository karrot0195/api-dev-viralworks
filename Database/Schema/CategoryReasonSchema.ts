import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';


interface Reason {
    readonly _id: string;
    readonly name: string;
}

interface CategoryReason extends IDocument {
    readonly name: string;
    readonly reasons: Array<Reason>;
}

const ReasonSchema = {
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        auto: true
    },
    name: {
        type: String,
        require: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: new Date()
    }
};

const CategoryReasonSchema = {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    reasons: {
        type: [ReasonSchema],
    },
};

export { CategoryReason, CategoryReasonSchema };
