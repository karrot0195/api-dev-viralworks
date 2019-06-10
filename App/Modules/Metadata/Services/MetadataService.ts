import { Injectable } from 'System/Injectable';
import { CategoryJobModel } from 'App/Models/CategoryJobsModel';
import { CategoryShareStoryModel } from 'App/Models/CategoryShareStoryModel';
import { ProvinceModel } from 'App/Models/ProvinceModel';
import { SuggestKolPriceModel } from 'App/Models/SuggestKolPriceModel';
import { FaqModel, FaqStatus, FaqType } from 'App/Models/FaqModel';
import { BankModel } from 'App/Models/BankModel';

@Injectable
export class MetadataService {
    constructor(
        private readonly _categoryJobModel: CategoryJobModel,
        private readonly _shareStoryModel: CategoryShareStoryModel,
        private readonly _provinceModel: ProvinceModel,
        private readonly _suggestPriceModel: SuggestKolPriceModel,
        private readonly _faqModel: FaqModel,
        private readonly _bankModel: BankModel
    ) {}

    async findAllCategoryJob() {
        return this._categoryJobModel
            .find()
            .select('-created_at -updated_at -jobs.created_at -jobs.updated_at -__v -jobs.__v -jobs.static_id');
    }

    async findAllShareStory() {
        return this._shareStoryModel
            .find()
            .select(
                '-created_at -updated_at -share_stories.created_at -share_stories.updated_at -__v -share_stories.__v -share_stories.static_id'
            );
    }

    async findAllProvince() {
        return this._provinceModel.find();
    }

    async findAllSuggestPrice() {
        return this._suggestPriceModel.find();
    }

    async findKolFaqs() {
        return this._faqModel.find({ status: FaqStatus.Publish, type: FaqType.KOLUser });
    }

    async findBanks() {
        return this._bankModel.find();
    }
}
