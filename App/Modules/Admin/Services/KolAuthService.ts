import * as Security from 'System/Security';
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
    KolInfoStatus
} from 'App/Models/KolUserModel';
import * as mongoose from 'mongoose';
import { InternalError, SystemError, NotFound } from 'System/Error';
import { evaluateOption } from 'App/Constants/Evaluate';
import { KolSearchField } from 'Database/Schema/KolUserSchema';
import { getEngagementUserPost } from 'App/Helpers/Facebook';

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

    findCondition(params: object) {
        return this._model.findWithFilter(params, KolSearchField);
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
                history_action: _.get(kolUser, 'kol_info.history_action', [])
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
                history_action: _.get(kolUser, 'kol_info.history_action', []),
                reason: _.get(kolUser, 'kol_info.reason_reject', null)
            };
        });
    }

    async removeKoluser(id: string) {
        const kolUser = await this._model.findById(id);
        if (!kolUser) {
            throw new NotFound('Not found kol user by id');
        }
        return kolUser.remove();
    }

    async updateEngagement(id: string) {
        const kolUser:any = await this._model.findById(id);
        if (!kolUser) {
            throw new NotFound('Not found kol user by id');
        }
        const entityId = _.get(kolUser, 'facebook.entity_id', null);
        if (!entityId) {
            throw new InternalError('The kol user is miss entity_id field');
        }

        const dataPost = await getEngagementUserPost(entityId);
        const totalPost = dataPost.total_post;
        const avgReact = dataPost.num_reaction / totalPost;
        const avgComment = dataPost.num_comment / totalPost;
        const avgShare = dataPost.num_share / totalPost;

        var analatic = _.get(kolUser, 'facebook.analytic', {});
        analatic['total_post_last_3_month'] = Math.round(totalPost);
        analatic['avg_reaction_last_3_month'] = Math.round(avgReact);
        analatic['avg_comment_last_3_month'] = Math.round(avgComment);
        analatic['avg_sharing_last_3_month'] = Math.round(avgShare);
        analatic['avg_engagement_last_3_month'] = Math.round(avgReact + avgComment + avgShare);

        _.set(kolUser, 'facebook.analytic', analatic);
        if (await kolUser.save()) {
            return analatic;
        }
        throw new InternalError('Error when save analytic');
    }
}
