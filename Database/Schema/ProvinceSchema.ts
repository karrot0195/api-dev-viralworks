import { IDocument } from "System/Interface";

export interface Province extends IDocument {
    readonly country: string;
    readonly name: string;
    readonly code: string;
}

export const ProvinceSchema = {
    country: String,
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    }
}