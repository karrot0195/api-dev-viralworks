import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IFaq, FaqModel } from 'App/Models/FaqModel';
import { FaqSearchField } from 'Database/Schema/FaqSchema';

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
        return this._faqModel.findWithFilter(params, FaqSearchField);
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