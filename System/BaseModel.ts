import { Model, Document, ClientSession, ModelUpdateOptions } from 'mongoose';

import { Mongo } from './Mongo';
import { processQuery } from 'Helpers/Format';

export abstract class BaseModel<I, T extends Document> {
    protected readonly _model: Model<T>;
    constructor(mongo: Mongo, name: string) {
        this._model = mongo.models[name] as Model<T>;
    }

    create(data: I, session?: ClientSession) {
        return new this._model(data).save({ session });
    }

    find(conditions?: any) {
        return this._model.find(conditions);
    }

    async findGET(query: any, modelSearchField: Array<string>) {
        let result: any;

        let queryData = processQuery(query, modelSearchField);

        let count: number = await this._model.countDocuments(queryData.conditions);
        if (count > 0) {
            result = await this._model.find(queryData.conditions, {}, queryData.options);
        } else {
            result = [];
        }

        return { total: count, results: result, limit: queryData.options.limit, page: queryData.options.page };
    }

    findById(id: string) {
        return this._model.findById(id);
    }

    findOne(conditions?: any) {
        return this._model.findOne(conditions);
    }

    update(conditions: any, data: I, options: ModelUpdateOptions = {}) {
        return this._model.update(conditions, data, options);
    }

    updateMany(conditions: any, data: I, options: ModelUpdateOptions = {}) {
        return this._model.updateMany(conditions, data, options);
    }

    updateOne(conditions: any, data: I, options: ModelUpdateOptions = {}) {
        return this._model.updateOne(conditions, data, options);
    }

    deleteOne(conditions: any) {
        return this._model.deleteOne(conditions);
    }

    deleteMany(conditions: any) {
        return this._model.deleteMany(conditions);
    }
}
