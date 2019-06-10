import { IDocument } from 'System/Interface';

export interface SuggestKolPrice extends IDocument {
    readonly follower: Array<number>;
    readonly sharelink: Array<number>;
    readonly repost: Array<number>;
    readonly photo: Array<number>;
    readonly livestream: Array<number>;
}

export const SuggestKolPriceSchema = {
    follower: [{ type: Number }],
    sharelink: [{ type: Number }],
    repost: [{ type: Number }],
    photo: [{ type: Number }],
    livestream: [{ type: Number }]
};
