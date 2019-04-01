import * as Security from 'App/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IFaq, FaqModel } from 'App/Models/FaqModel';

@Injectable
export class FaqService {
    constructor(private readonly _config: Config, private readonly _mongo: Mongo, private readonly _faqModel: FaqModel) { }

    create(data: IFaq) {
        return this._faqModel.createFaq(data);
    }

    findById(id: string) {
        return this._faqModel.findById(id);
    }

    findByCondition(params: Object) {
        let limit = 10, offset = 0, optConditions = {}, optSort = {};

        if (params['limit']) {
            limit = parseInt(params['limit']);
        }

        if (params['page']) {
            let page = parseInt(params['page']);
            offset = (page - 1) * limit;
        }

        if (params['type']) {
            optConditions['type'] = parseInt(params['type']);
        }

        if (params['sort']) {
            Object.keys(params['sort']).forEach(key => {
                if (parseInt(params['sort'][key])) {
                    optSort[key] = 'asc'; 
                } else {
                    optSort[key] = 'desc'; 
                }
            });
        }

        return this._faqModel.find(optConditions).limit(limit).skip(offset).sort(optSort);
    }

    async updateFaq(id: string, params: Object) {
        const contact  = await this._faqModel.findById(id);
        if (contact) {
            Object.keys(params).forEach(key => {
                contact[key] = params[key];
            });
            return contact.save();
        }
        return false;
    }
}