import { Injectable } from "System/Injectable";
import { Mongo } from "System/Mongo";
import { BaseModel } from "System/BaseModel";
import { SuggestKolPrice } from "Database/Schema/SuggestKolPriceSchema";

interface ISuggestKolPrice {
    readonly follower: Array<number>;
    readonly sharelink: Array<number>;
    readonly repost: Array<number>;
    readonly photo: Array<number>;
    readonly livestream: Array<number>;
}

@Injectable
export class SuggestKolPriceModel extends BaseModel<ISuggestKolPrice, SuggestKolPrice> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'suggest_kol_price');
    }
}