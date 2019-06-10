import { Injectable } from "System/Injectable";
import { Mongo } from "System/Mongo";
import { LogModel, ILog } from "App/Models/LogModel";

@Injectable
export class LogService {
    constructor(private _mongo: Mongo, private _logModel: LogModel) {}
    create(data: ILog) {
        return this._logModel.create(data);
    }
}