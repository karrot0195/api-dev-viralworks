import { Document } from 'mongoose';

export interface IDocument extends Document {
    readonly created_at: Date;
    readonly updated_at: Date;
}