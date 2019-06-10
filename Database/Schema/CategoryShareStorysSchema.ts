import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';


interface ShareStory {
    readonly _id: string;
    readonly name: string;
    readonly static_id: number;
}

interface CategoryShareStory extends IDocument {
    readonly name: string;
    readonly share_stories: Array<ShareStory>;
}

const ShareStorySchema = {
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

const CategoryShareStorySchema = {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    share_stories: {
        type: [ShareStorySchema],
    },
};

export { CategoryShareStory, CategoryShareStorySchema };
