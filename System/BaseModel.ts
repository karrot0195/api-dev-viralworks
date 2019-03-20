import { Model, Document, ClientSession, ModelUpdateOptions } from 'mongoose';

import { Mongo } from './Mongo';

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