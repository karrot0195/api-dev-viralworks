import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { KolUserModel } from 'App/Models/KolUserModel';
import { NotFound } from 'System/Error/NotFound';
import { IKolPrice } from 'App/Constants/Models/KolUser/IKolItem';
import { Config } from 'System/Config';
import { KolJobModel, KolJobStatus } from 'App/Models/KolJobModel';
import { JobStatus } from 'App/Models/JobModel';


export interface IBasicInfo {
    readonly sex: number;
    readonly matrimony: number;
    readonly dob: number;
    readonly num_child: number;
    readonly facebook_name: string;
    readonly facebook_link: string;
    readonly mobile: string;
    readonly location: string;
    readonly notification_job: boolean;
    readonly step: number;
}

@Injectable
export class KolService {
    constructor(
        private _config: Config,
        private _mongo: Mongo,
        private _kolUserModel: KolUserModel,
        private _kolJobModel: KolJobModel
    ) {}

    public async uploadPayment(kId: string, paymentInfo: object, deliveryInfo: object) {
        const kolUser = await this.findKolUserById(kId);
        if (paymentInfo) {
            Object.keys(paymentInfo).forEach(k => {
                kolUser['payment_info'][k] = paymentInfo[k];
            });
        }

        if (deliveryInfo) {
            Object.keys(deliveryInfo).forEach(k => {
                kolUser['delivery_info'][k] = deliveryInfo[k];
            });
        }

        await kolUser.save();
        return {
            payment_info: kolUser.payment_info,
            delivery_info: kolUser.delivery_info
        };
    }

    public async updateBasicInfo(kId: string, data: IBasicInfo) {
        const kolUser = await this.findKolUserById(kId);
        if (data.location) {
            kolUser.location = data.location;
        }

        // kol info
        if (data.dob) {
            kolUser.kol_info['dob'] = data.dob;
        }

        if (data.mobile) {
            kolUser.kol_info['mobile'] = data.mobile;
        }

        if (data.sex) {
            kolUser.kol_info['sex'] = data.sex;
        }

        if (data.matrimony) {
            kolUser.kol_info['matrimony'] = data.matrimony;
        }

        if (data.num_child) {
            kolUser.kol_info['num_child'] = data.num_child;
        }

        // facebook
        if (data.facebook_link) {
            kolUser.facebook['profile_link'] = data.facebook_link;
        }

        if (data.facebook_name) {
            kolUser.facebook['name'] = data.facebook_name;
        }

        if (data.notification_job) {
            console.log(data.notification_job);
            kolUser.kol_info['notification_job'] = data.notification_job;
        }

        if (data.step) {
            kolUser.kol_info['step'] = data.step;
        }
        await kolUser.save();
        return data;
    }

    public async uploadJob(kId: string, jobs: Array<string>, jobOther: Array<string>) {
        const kolUser = await this.findKolUserById(kId);
        if (kolUser.kol_info) {
            kolUser.kol_info['job'] = jobs;
            kolUser.kol_info['job_other'] = jobOther;
        }
        await kolUser.save();
        return {
            jobs: kolUser.kol_info['job'],
            job_others: kolUser.kol_info['job_other']
        };
    }

    public async uploadShareStory(kId: string, shareStories: Array<string>, shareStoryOthers: Array<string>) {
        const kolUser = await this.findKolUserById(kId);
        if (kolUser.kol_info) {
            kolUser.kol_info['share_story'] = shareStories;
            kolUser.kol_info['share_story_other'] = shareStoryOthers;
        }
        await kolUser.save();
        return {
            share_stories: kolUser.kol_info['share_story'],
            share_story_others: kolUser.kol_info['share_story_other']
        };
    }

    public async uploadPrice(kId: string, data: IKolPrice) {
        const kolUser = await this.findKolUserById(kId);
        kolUser.kol_info['price'] = data;
        await kolUser.save();
        return {
            price: kolUser.kol_info['price']
        };
    }

    public async getJobRunningList(kId: string) {
        return this._kolJobModel
            .find({ kol_id: kId, status: KolJobStatus.Active , is_block: false })
            .populate('job_id', ['-invites', '-kol_jobs', '-groups', '-questions.choose', '-assign_brand']);
    }

    public async getDetailJob(kId: string, kJobId: string) {
        return this._kolJobModel.findOne({ kol_id: kId, _id: kJobId, is_block: false })
            .populate('job_id', ['-invites', '-kol_jobs', '-groups', '-questions.choose', '-assign_brand']);
    }

    public async getJobCompletedList(kId: string) {
        return this._kolJobModel
            .find({ kol_id: kId, status: {$ne: KolJobStatus.Active } })
            .populate('job_id', ['-invites', '-kol_jobs', '-groups', '-questions.choose', '-assign_brand']);
    }

    private async findKolUserById(kId: string) {
        const kolUser = await this._kolUserModel.findById(kId);
        if (!kolUser) throw new NotFound('KOL_USER_NOT_FOUND');
        return kolUser;
    }
}
