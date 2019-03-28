import * as Security from 'App/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IKolUser, KolUserModel, IKolBasicInfo, IKolFacebookInfo } from 'App/Models/KolUserModel';
import { isString } from 'util';

@Injectable
export class KolAuthService {
    constructor(private readonly _config: Config, private readonly _mongo: Mongo, private readonly _model: KolUserModel) { }

    create(data: IKolUser) {
        return this._model.create(data);    
    }

    findAll(params: Object) {
        let embedded = [];
        if (params['embedded'] && isString(params['embedded'])) {
            embedded = params['embedded'].split(',');
        }
        return this._model.find().select(embedded);
    }

    findById(id: string, embeddedParams?: string) {
        let embedded:any;
        if (embeddedParams && isString(embeddedParams)) {
            embedded = embeddedParams.split(',');
        }

        return this._model.findById(id).select(embedded);
    }

    async updateBasicInfo(kolUser: any, data: IKolBasicInfo) {
        Object.keys(data).forEach(k => {
            kolUser.kol_info[k] = data[k];
        });
        const result = await kolUser.save();
        return result.kol_info;
    }

    async updateFacebookInfo(kolUser: any, data: IKolFacebookInfo) {
        Object.keys(data).forEach(k => {
            kolUser.facebook[k] = data[k];
        });
        const result = await kolUser.save();
        return result.facebook;
    }
}