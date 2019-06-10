import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { Mongo } from "System/Mongo";
import { Log } from "Database/Schema/LogSchema";

export interface ILog {
    readonly name: string;
    readonly stack?: string;
    readonly status?: number;
    readonly message: String;
    readonly caused_by?: String;
}

@Injectable
export class LogModel extends BaseModel<ILog, Log> {
    constructor(private _mongo: Mongo) {
        super(_mongo, 'log');
    }
}