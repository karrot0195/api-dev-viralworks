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
        type: Number,
        default: 0
    },
    type: {
        type: Number
    }
}

export const FaqSearchField = ['question', 'answer', 'type', 'status'];