import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { Mongo } from 'System/Mongo';
import { CategoryReasonModel, ICategoryReason, IReason } from 'App/Models/CategoryReasonModel';
import * as _ from 'lodash';
import { Conflict, NotFound } from 'System/Error';

@Injectable
export class CategoryReasonService {
    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _categoryReasonModel: CategoryReasonModel
    ) {}

    createCategoryReason(data: ICategoryReason) {
        return this._categoryReasonModel.create(data);
    }

    getReasons() {
        return this._categoryReasonModel.find();
    }

    findCategoryReasonById(id: string) {
        return this._categoryReasonModel.findById(id);
    }

    async updateCategoryReason(catReason: any, data: ICategoryReason) {
        Object.keys(data).forEach(k => {
            _.set(catReason, k, data[k]);
        });
        return catReason.save();
    }

    async createReason(catReason: any, data: IReason) {
        catReason.reasons.forEach(obj => {
            if (obj.name == data.name) {
                throw new Conflict('Dulicate reason');
            }
        });
        catReason.reasons.push(data);
        const result = catReason.save();
        return result.reasons[result.reasons.length-1];
    }

    async updateReason(catReason: any, idx: number, data: IReason) {
        Object.keys(data).forEach(k => {
            _.set(catReason.reasons[idx], k, data[k]);
        });
        const result = await catReason.save();
        return result.reasons[idx];
    }

    getIndexReason(catReason: any, id: string) {
        let idx = -1;
        catReason.reasons.forEach((obj, i) => {
            if (obj._id == id) {
                idx = i;
                return;
            }
        });
        return idx;
    }

    async removeCategoryReason(categoryId: string) {
        const catgoryReason = await this._categoryReasonModel.findById(categoryId);
        if (!catgoryReason) {
            throw new NotFound('Not found category reason by id');
        }

        return catgoryReason.remove();
    }

    async deleteReason(categoryId: string, reasonId: string) {
        const catgoryReason = await this._categoryReasonModel.findById(categoryId);
        if (!catgoryReason) {
            throw new NotFound('Not found category reason by id');
        }
        catgoryReason.reasons.forEach((reason, idx) => {
            if (reason._id == reasonId) {
                catgoryReason.reasons.splice(idx, 1);
            }
        });
        return await catgoryReason.save();
    }
}
