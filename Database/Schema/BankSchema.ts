import { Schema } from 'mongoose';
import { IDocument } from 'System/Interface/Mongo';

export interface Bank extends IDocument {
    name: string;
    provinces: Array<{key: string, branch: Array<string>}>;
}

export const BankSchema = {
    name: Schema.Types.String,
    provinces: [ { key: Schema.Types.String, branch: [ Schema.Types.String ] } ]
};
