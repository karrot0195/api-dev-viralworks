import * as Mongoose from 'mongoose';
import { singular } from 'pluralize';

import { Injectable } from './Injectable';
import { Config } from './Config';
import { ModelDict } from 'Database';

@Injectable
export class Mongo {
    private _mongodb: Mongoose.Connection;
    public models: ModelDict;
    private _connectionString: string;
    constructor(private readonly _config: Config) {
        const mongoConfig = this._config.mongodb;
        this._connectionString = `mongodb://${mongoConfig.username}:${encodeURIComponent(mongoConfig.password)}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`;

        Mongoose.connect(this._connectionString, { useNewUrlParser: true, replicaSet: 'rs0' });
        Mongoose.set('useCreateIndex', true);

        if (mongoConfig.debug) Mongoose.set('debug', true);

        this._mongodb = Mongoose.connection;
        // this.mongodb.useDb('main_vw_v3');
        this._mongodb.on('error', (error) => {
            console.error.bind(console, 'MogoDB connection error')(error);
            process.exit();
        });

        this._mongodb.on('open', async (ref) => {
            const collections = await this._mongodb.db.listCollections().toArray();

            for (const collection of collections) {
                if (!this.models[collection.name] && !this.models[singular(collection.name)]) {
                    (this.models[collection.name] as any) = Mongoose.model(collection.name, new Mongoose.Schema({}, { strict: false }));
                }
            }
        });
    }

    async transaction<T>(f: (session: Mongoose.ClientSession) => Promise<T>) {
        const session = await Mongoose.startSession();
        session.startTransaction();

        try {
            const result = await f(session);
            await session.commitTransaction();
            session.endSession();
            return result;
        } catch (e) {
            await session.abortTransaction();
            session.endSession();
            throw e;
        }
    }

    define(modelName: string, schemaObject: { schema: {}; index?: {}; class?: Function; }) {
        const schema = new Mongoose.Schema(schemaObject.schema, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

        if (schemaObject.index) {
            schema.index(schemaObject.index);
        }

        if (schemaObject.class) {
            schema.loadClass(schemaObject.class);
        }

        const model = Mongoose.model(modelName, schema);

        if (this.models) {
            Object.assign(this.models, { [modelName]: model });
        } else {
            (this.models as any) = Object.assign({}, { [modelName]: model });
        }

        return model;
    }
}