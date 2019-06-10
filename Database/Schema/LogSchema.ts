import { IDocument } from 'System/Interface';
import * as mongoose from 'mongoose';

export interface Log extends IDocument {
    readonly name: string;
    readonly stack: string;
    readonly status: number;
    readonly message: String;
    readonly caused_by: string;
}

export const LogSchema = {
    name: String,
    stack: String,
    status: Number,
    message: String
};

export const LogSchemaOption = {
    capped: { size: 204800, max: 100, autoIndexId: true } // 100 document
}