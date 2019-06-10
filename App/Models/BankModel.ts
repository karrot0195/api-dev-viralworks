import { Injectable } from 'System/Injectable';
import { Bank } from 'Database/Schema/BankSchema';
import { BaseModel } from 'System/BaseModel';
import { Mongo } from 'System/Mongo';

export interface IBank {
    readonly name: string;
    readonly provinces: Array<object>;
}
@Injectable
export class BankModel extends BaseModel<IBank, Bank> {
    constructor(private _mongo: Mongo) {
        super(_mongo, 'bank');
    }
}