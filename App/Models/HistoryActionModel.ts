import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel } from 'System/BaseModel';
import { HistoryAction } from 'Database/Schema/HistoryActionSchema';

export enum HistoryActionType {
    Status = 1,
    Mail = 2,
    Income = 3,
    RequestPayment = 4,
    KolState = 5,
    KolEvaluate = 6
}

export enum ReasonMessage {
    RequestPayment = 'create request payment'
}

export interface IHistoryAction {
    readonly causer_id?: string;
    readonly kol_id: string;
    readonly type: number;
    readonly ref_id?: string;
    readonly kol_status?: number;
    readonly reason?: string;
    readonly kol_state?: number;
}

@Injectable
export class HistoryActionModel extends BaseModel<IHistoryAction, HistoryAction> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'history_action');
    }
}
