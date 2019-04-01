import { IDocument } from 'System/Interface';

export interface Faq extends IDocument {
    question: string;
    answer: string;
    status: number;
    type: number;
}

export const FaqSchema = {
    question: {
        type: String
    },
    answer: {
        type: String
    },
    status: {
        type: Number
    },
    type: {
        type: Number
    }
}