import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { Mongo } from "System/Mongo";
import { Province } from "Database/Schema/ProvinceSchema";

interface IProvince {
    readonly country: string;
    readonly name: string;
    readonly code: string;
}


@Injectable
export class ProvinceModel extends BaseModel<IProvince, Province> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'province');
    }
}
