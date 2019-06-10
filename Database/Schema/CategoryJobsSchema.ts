import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';


interface Job {
    readonly _id: string;
    readonly name: string;
    readonly static_id: number;
}

interface CategoryJob extends IDocument {
    readonly name: string;
    readonly jobs: Array<Job>;
}

const JobSchema = {
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        auto: true
    },
    name: {
        type: String,
        require: true
    },
    static_id: {
        type: Number
    },
    created_at: {
        type: Date,
        default: new Date()
    }
};

const CategoryJobSchema = {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    jobs: {
        type: [JobSchema],
    },
};

export { CategoryJob, CategoryJobSchema };
