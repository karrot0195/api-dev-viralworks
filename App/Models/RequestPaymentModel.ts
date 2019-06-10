import { Injectable } from 'System/Injectable';
import { BaseModel } from 'System/BaseModel';
import { RequestPayment } from 'Database/Schema/RequestPaymentSchema';
import { Mongo } from 'System/Mongo';

export interface IRequestPayment {
    readonly price: number;
    readonly kol_id: string;
}

export enum RequestPaymentStatus {
    Raw = 0,
    Accept = 1,
    Reject = -1
}

@Injectable
export class RequestPaymentModel extends BaseModel<IRequestPayment, RequestPayment>{
    constructor(readonly mongo: Mongo) {
        super(mongo, 'request_payment');
    }
}