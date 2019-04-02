import * as Security from 'App/Helpers/Security';
import * as _ from 'lodash';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import {
    IKolUser,
    KolUserModel,
    IKolBasicInfo,
    IKolFacebookInfo,
    IKolEvalute,
    HistoryActionType,
    KolInfoStatus,
} from 'App/Models/KolUserModel';
import * as mongoose from 'mongoose';
import { InternalError, SystemError } from 'System/Error';
import { evaluateOption } from 'App/Constants/Evaluate';

@Injectable
export class KolAuthService {
    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _model: KolUserModel
    ) {}

    create(data: IKolUser) {
        return this._model.create(data);
    }

    findAll(params: Object) {
        return this._model.find();
    }

    findById(id: string) {
        return this._model.findById(id);
    }

    async updateBasicInfo(kolUser: any, data: IKolBasicInfo) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.kol_info, k, data[k]);
        });
        const result = await kolUser.save();
        return result.kol_info;
    }

    async updateFacebookInfo(kolUser: any, data: IKolFacebookInfo) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.facebook, k, data[k]);
        });
        const result = await kolUser.save();
        return result.facebook;
    }

    getEvaluateOption(fields: Array<string>) {
        const data = evaluateOption;
        if (fields === undefined || fields.length === 0) {
            return data;
        }
        let obj = {};
        fields.forEach(key => {
            if (key) {
                obj[key] = _.get(data, key, null);
            }
        });
        return obj;
    }

    async updateEvaluateInfo(kolUser: any, data: IKolEvalute) {
        Object.keys(data).forEach(k => {
            _.set(kolUser, `kol_info.evaluate.${k}`, data[k]);
        });
        const result = await kolUser.save();
        return _.get(result.kol_info, 'evaluate');
    }

    async verifyKolInfo(kolUser: any, causer_id: string) {
        return this._mongo.transaction(async session => {
            // push history for action
            _.get(kolUser, 'kol_info.history_action', []).push({
                causer_id: causer_id,
                type: HistoryActionType.Status,
                kol_status: KolInfoStatus.Verified
            });

            // set status for kol user
            _.set(kolUser, 'kol_info.status', KolInfoStatus.Verified);

            const result = await kolUser.save({ session });
            
            if (!result) {
                throw new SystemError('Not save data');
            }

            return {
                status: KolInfoStatus.Verified,
                history_action:  _.get(kolUser, 'kol_info.history_action', [])
            };
        });
    }

    async rejectKolInfo(kolUser: any, causer_id: string, reason: object) {
        return this._mongo.transaction(async session => {
            // push history for action
            _.get(kolUser, 'kol_info.history_action', []).push({
                causer_id: causer_id,
                type: HistoryActionType.Status,
                kol_status: KolInfoStatus.Rejected
            });

            // set status for kol user
            _.set(kolUser, 'kol_info.status', KolInfoStatus.Rejected);

            // set reason reject
            _.set(kolUser, 'kol_info.reason_reject', {
                reason_id: reason['reason_id'],
                description: reason['description']
            });

            const result = await kolUser.save({ session });
            
            if (!result) {
                throw new SystemError('Not save data');
            }

            return {
                status: KolInfoStatus.Rejected,
                history_action:  _.get(kolUser, 'kol_info.history_action', []),
                reason: _.get(kolUser, 'kol_info.reason_reject', null)
            };
        });
    }
}
