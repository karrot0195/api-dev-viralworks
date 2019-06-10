import { Model, Document, ClientSession, ModelUpdateOptions, ModelPopulateOptions, Query } from 'mongoose';

import { Mongo } from './Mongo';
import { processQuery, processField } from './Helpers/Format';
import { PaginationData } from './Interface/PaginationData';

export interface IHookFilterCondition {
    beforeQuery?: Function;
    beforeExcuteQuery?: Function;
    beforeResultData?: Function;
    afterExcuteQuery?: Function;
}

export abstract class BaseModel<I, T extends Document> {
    protected readonly _model: Model<T>;
    constructor(mongo: Mongo, name: string) {
        this._model = mongo.models[name] as Model<T>;
    }

    create(data: I, session?: ClientSession) {
        return new this._model(data).save({ session });
    }

    find(conditions?: any, projection: any = {}) {
        return this._model.find(conditions, projection);
    }

    async findWithFilter(
        query: any,
        modelSearchField: Array<string>,
        hook?: IHookFilterCondition,
        population?: ModelPopulateOptions | ModelPopulateOptions[]
    ): Promise<any> {
        let data: PaginationData = {};

        let queryData = processQuery(query, modelSearchField);

        if (hook && hook.beforeQuery) await hook.beforeQuery(queryData); // hook before query

        let queryBase = this._model.find(queryData.conditions, queryData.projections);

        if (hook && hook.beforeExcuteQuery) await hook.beforeExcuteQuery(queryBase); // hook before excute query

        if (population) {
            queryBase.populate(population);
        }
        const [results, count] = await Promise.all([
            await queryBase
                .limit(queryData.options.limit)
                .skip(queryData.options.skip)
                .sort(queryData.options.sort),
            await queryBase.limit(0).skip(0).count()
        ]);

        data.total = count;
        data.limit = queryData.options.limit;
        data.page = queryData.options.page;

        data.lastpage = data.limit;
        if (data.limit !== 0) data.lastpage = Math.floor(data.total / data.limit!) - (data.total % data.limit! ? 0 : 1);

        data.from = data.page! * data.limit!;
        if (results.length === 0) data.from = -1;

        data.to = data.from + results.length - 1;
        if (results.length === 0) data.to = -1;

        if (hook && hook.afterExcuteQuery) {
            data.results = await hook.afterExcuteQuery(results); // hook after excute query
        } else {
            data.results = results;
        }
        if (hook && hook.beforeResultData) await hook.beforeResultData(data); // hook before result data
        return data;
    }

    findById(id: string, fields: string = '') {
        return this._model.findById(id).select(processField(fields));
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

    insertMany(data: I[], options?: any) {
        return this._model.insertMany(data, options);
    }

    dropCollection() {
        return this._model.collection.drop();
    }

    count(conditions: any, callback?: (err: any, count: number) => void): Query<number> {
        return this._model.count(conditions, callback);
    }
}
