import * as _ from 'lodash';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IKolUser, KolUserModel, KolInfoStatus, SearchField, KolStatus } from 'App/Models/KolUserModel';
import { InternalError, NotFound } from 'System/Error';
import { evaluateOption } from 'App/Constants/Evaluate';
import { getEngagementUserPost } from 'App/Helpers/Facebook';
import { HistoryActionModel, HistoryActionType } from 'App/Models/HistoryActionModel';
import { IKolBasicInfoItem, IKolFacebookInfoItem, IKolEvaluteItem } from 'App/Constants/Models/KolUser/IKolItem';
import { MailModel } from 'App/Models/MailModel';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { Query, ClientSession } from 'mongoose';
import { generateSummaryInfo, getKeyFromText, showDebug } from 'App/Helpers/Generator';
import { isString } from 'util';
import { JobType } from 'App/Models/JobModel';
import { HistoryAction } from 'Database/Schema/HistoryActionSchema';
import { getUserFollower } from 'Facade/SocialiteProvider/Helper/FacebookHelper';
import { RequestPaymentModel } from 'App/Models/RequestPaymentModel';
import { KolJobModel } from 'App/Models/KolJobModel';

@Injectable
export class KolManagerService {
    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _kolModel: KolUserModel,
        private readonly _historyModel: HistoryActionModel,
        private readonly _mailModel: MailModel,
        private readonly _requestPayment: RequestPaymentModel,
        private readonly _kolJobModel: KolJobModel
    ) {}

    public create(data: IKolUser) {
        generateSummaryInfo(data);
        return this._kolModel.create(data);
    }

    public findCondition(params: object) {
        return this._kolModel.findWithFilter(params, SearchField, {
            beforeExcuteQuery: async (query: Query<KolUser>) => {
                this.queryFilter(query, params);
                this.queryFields(query, params);
                this.queryExcludeIds(query, params);
            },
            afterExcuteQuery: async data => {
                const arr: Array<any> = [];
                for (var r of data) {
                    arr.push(await this.embeddedsVirtual(r));
                }
                return arr;
            }
        });
    }

    public async embeddedsVirtual(r: any) {
        var r1 = r.toObject();
        // job
        r1['kol_info']['job'] = await r.kol_info['cat_jobs'];
        delete r1['kol_info']['cat_jobs'];

        r1['kol_info']['share_story'] = await r.kol_info['cat_share_stories'];
        delete r1['kol_info']['cat_share_stories'];

        return r1;
    }

    public findByEmail(email: string) {
        return this._kolModel.findOne({ email: email });
    }

    public async getMails(kolId: string) {
        const kolUser = await this.findById(kolId).populate('histories');
        if (!kolUser) throw new NotFound('KOL_USER_NOT_FOUND');
        var data: Array<object> = [];
        const takeMessage = async () => {
            var messageIds: Array<string> = [];
            (<Array<HistoryAction>>kolUser.histories).map(async item => {
                if (item.type == HistoryActionType.Mail && item.ref_id) {
                    var dataItem: any = item.toObject();
                    messageIds.push(item.ref_id);
                    data.push(dataItem);
                }
            });

            (await this._mailModel.find({ message_id: { $in: messageIds } })).forEach(message => {
                var dataItem = data.find(item => item['ref_id'] == message.message_id);
                if (dataItem) {
                    dataItem['message'] = message;
                }
            });
        };
        await takeMessage();
        return data;
    }

    public findById(id: string) {
        return this._kolModel.findById(id);
    }

    public save(kolUser: KolUser, session?: ClientSession) {
        generateSummaryInfo(kolUser);
        return kolUser.save({ session });
    }

    public async updateBasicInfo(kolUser: KolUser, data: IKolBasicInfoItem) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.kol_info, k, data[k]);
        });
        const result = await this.embeddedsVirtual(await this.save(kolUser));
        delete result.password;
        return result;
    }

    public async updateFacebookInfo(kolUser: KolUser, data: IKolFacebookInfoItem) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.facebook, k, data[k]);
        });
        generateSummaryInfo(kolUser);
        const result = await this.save(kolUser);
        return result.facebook;
    }

    public getEvaluateOption(fields: Array<string>) {
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

    public async updateEvaluateInfo(causerId: string, kId: string, data: IKolEvaluteItem) {
        const kUser = await this._kolModel.findById(kId);
        if (!kUser) throw new NotFound('KOL_USER_NOT_FOUND');

        return this._mongo.transaction(async session => {
            Object.keys(data).forEach(k => {
                _.set(kUser, `kol_info.evaluate.${k}`, data[k]);
            });

            const historyAction = await this._historyModel.create(<any>{
                type: HistoryActionType.KolEvaluate,
                kol_state: kUser.status,
                kol_status: kUser.kol_info['status'],
                causer_id: causerId
            });

            if (historyAction) {
                kUser.histories.push(historyAction._id);
            }

            await kUser.save({ session: session });
            return _.get(kUser.kol_info, 'evaluate');
        });
    }

    public async verifyKolInfo(kolUser: KolUser, causer_id: string) {
        return this._mongo.transaction(async session => {
            // push history for action
            const historyAction = await this._historyModel.create({
                causer_id: causer_id,
                type: HistoryActionType.Status,
                kol_id: kolUser._id,
                kol_status: KolInfoStatus.Verified,
                ref_id: ''
            });
            (<Array<string>>kolUser.histories).push(historyAction._id);
            _.set(kolUser, 'kol_info.status', KolInfoStatus.Verified);

            const result = await this.save(kolUser, session);

            if (!result) {
                throw new InternalError('SAVE_ERROR');
            }

            return {
                status: KolInfoStatus.Verified,
                history_action: historyAction
            };
        });
    }

    public async rejectKolInfo(kolUser: KolUser, causer_id: string, reason: object) {
        return this._mongo.transaction(async session => {
            // push history for action
            const historyAction = await this._historyModel.create({
                causer_id: causer_id,
                type: HistoryActionType.Status,
                kol_id: kolUser._id,
                kol_status: KolInfoStatus.Rejected,
                ref_id: reason['reason_id'],
                reason: reason['description']
            });

            kolUser.histories.push(historyAction._id);
            _.set(kolUser, 'kol_info.status', KolInfoStatus.Rejected);

            const result = await this.save(kolUser, session);
            if (!result) {
                throw new InternalError('SAVE_ERROR');
            }
            return {
                status: KolInfoStatus.Rejected,
                history_action: historyAction
            };
        });
    }

    public async removeKoluser(id: string) {
        const kolUser = await this._kolModel.findById(id);
        if (!kolUser) {
            throw new NotFound('KOL_USER_NOT_FOUND');
        }
        await kolUser.remove();
        return true;
    }

    public async updateEngagement(id: string, session?: ClientSession) {
        const kolUser = <KolUser>await this._kolModel.findById(id);
        if (!kolUser) {
            throw new NotFound('KOL_USER_NOT_FOUND');
        }
        const entityId = _.get(kolUser, 'facebook.entity_id', null);
        if (!entityId) {
            throw new InternalError('ENTITY_ID_FIELD_NOT_FOUND');
        }

        const dataPost = await getEngagementUserPost(entityId);
        const totalPost = dataPost.total_post;
        const avgReact = dataPost.num_reaction / totalPost;
        const avgComment = dataPost.num_comment / totalPost;
        const avgShare = dataPost.num_share / totalPost;

        // update follower
        const totalFollower = await getUserFollower(_.get(kolUser, 'facebook.app_scoped_id', null));

        var analatic = _.get(kolUser, 'facebook.analytic', {});
        analatic['total_post_last_3_month'] = Math.round(totalPost);
        analatic['avg_reaction_last_3_month'] = Math.round(avgReact);
        analatic['avg_comment_last_3_month'] = Math.round(avgComment);
        analatic['avg_sharing_last_3_month'] = Math.round(avgShare);
        analatic['avg_engagement_last_3_month'] = Math.round(avgReact + avgComment + avgShare);
        analatic['total_follower'] = totalFollower;
        analatic['latest_updated'] = new Date();

        _.set(kolUser, 'facebook.analytic', analatic);

        await this.save(kolUser, session);

        return analatic;
    }

    public async getHistoryAction(kolId: string, page: number, limit: number, sort: string) {
        if (!limit) limit = 10;
        if (!page) page = 0;
        if (!sort) sort = 'desc';
        const offset: number = page * limit;
        const kol = await this._kolModel.findById(kolId).select(['histories', 'email', 'facebook.name']);
        let total: number = 0;
        let data: Array<any> = [];
        const mailTypes = [
            { code: 1, message: 'send mail verify kol' },
            { code: 2, message: 'send mail reject kol' },
            { code: 3, message: 'send mail request update facebook' },
            { code: 11, message: 'send mail accept request payment' },
            { code: 12, message: 'send mail reject request payment' },
            { code: 13, message: 'Request a confirmation password' },
            { code: 14, message: 'Request a confirmation email' }
        ];

        const kolStatus = [
            { code: 0, message: 'change status kol to raw' },
            { code: 1, message: 'change status kol to verify' },
            { code: 2, message: 'change status kol to reject' }
        ];

        if (kol && kol.histories) {
            total = kol.histories.length;
            const histories = await this._historyModel
                .find({ _id: { $in: kol.histories } })
                .populate('causer_id', ['name', 'email'])
                .limit(limit)
                .skip(offset)
                .sort(sort);
            const mails = await this._mailModel.find({ email: kol.email }).select(['mail_type', 'status']);
            for (const history of histories) {
                let row: any = {};
                let name: string = '';
                if (kol.facebook && kol.facebook['name']) {
                    name = kol.facebook['name'];
                } else {
                    name = kol.email;
                }

                if (history.kol_state) {
                    row.account_status = row.kol_state;
                }

                if (history.causer_id) {
                    row.causer_id = history.causer_id;
                }

                row.type = history.type;
                row.created_at = history.created_at;
                row.id = history._id;
                row.detail = {};
                let isPush = true;
                switch (history.type) {
                    case HistoryActionType.Mail:
                        const mail = mails.find(m => m._id.toString() == history.ref_id);
                        if (mail) {
                            let message: any = mailTypes.find(m => mail.mail_type == m.code);
                            if (!message) {
                                isPush = false;
                            } else {
                                let text = message ? message.message : '';
                                if (text) {
                                    if (history.causer_id) {
                                        text = `${history.causer_id['name']} ${text} to ${name}`;
                                    } else {
                                        text = `${name} ${text}`;
                                    }
                                }
                                row.detail.desciption = text;
                                row.detail.mail_status = mail && mail.status ? mail.status : null;
                            }
                        }
                        break;
                    case HistoryActionType.Status:
                        {
                            const message = kolStatus.find(s => history.kol_status.toString() == s.code.toString());
                            let text = message ? message.message : '';
                            if (history.causer_id && text) {
                                text = `${history.causer_id['name']} ${text}`;
                            }

                            row.detail.description = text;
                        }
                        break;
                    case HistoryActionType.KolEvaluate:
                        {
                            let text: string = 'evaluate kol';
                            if (history.causer_id && text) {
                                text = `${history.causer_id['name']} ${text}`;
                            }
                            row.detail.description = text;
                        }
                        break;
                    case HistoryActionType.KolState:
                        {
                            let text: string = '';
                            if (history.kol_state == 1) {
                                text = 'disable account';
                            } else {
                                text = 'enable account';
                            }
                            if (history.causer_id && text) {
                                text = `${history.causer_id['name']} ${text}`;
                            }
                            row.detail.description = text;
                        }
                        break;
                    case HistoryActionType.RequestPayment:
                        {
                            row.detail.description = `${name} requires payment`;
                            if (history.ref_id) {
                                const request = await this._requestPayment.findById(history.ref_id);
                                if (request) {
                                    row.detail.request_status = request.status;
                                    row.detail.request_price = request.price;
                                }
                            }
                        }
                        break;

                    case HistoryActionType.Income:
                        {
                            let text: string = `${name} receives money from job`;
                            row.detail.description = text;

                            if (history.ref_id) {
                                const job = await this._kolJobModel.findById(history.ref_id).populate('job_id', ['title']);
                                if (job) {
                                    row.detail.job_title = job.job_id['title'];
                                    row.detail.job_price = job.price;
                                }
                            }
                        }
                        break;
                }
                if (isPush) {
                    data.push(row);
                }
            }
        }
        return {
            total: total,
            results: data,
            limit: limit,
            page: page,
            from: offset,
            to: offset + limit < total ? offset + limit : total,
            lastpage: Math.round(total / limit)
        };
    }

    public async updateState(casuerId: string, kolId: string, state: string) {
        const kol = await this._kolModel.findById(kolId);
        if (!kol) throw new NotFound('KOL_USER_NOT_FOUND');
        if (state == 'enable') {
            kol.status = KolStatus.Enable;
        } else {
            kol.status = KolStatus.Disable;
        }

        return this._mongo.transaction(async session => {
            const history = await this._historyModel.create(
                {
                    causer_id: casuerId,
                    kol_id: kol._id,
                    kol_state: kol.status,
                    type: HistoryActionType.KolState
                },
                session
            );
            kol.histories.push(<string>history._id);
            return kol.save({ session: session });
        });
    }

    /* PRIVATE */
    private queryFields(query: any, params: object) {
        // sort
        var fields: Array<string> = [];

        if (params['field']) {
            fields = params['field'].trim().split(',');
        }
        if (fields.length) {
            fields = fields.filter(f => f != 'password');
            query.select(fields);
        } else {
            query.select('-password');
        }
        if (fields.length == 0 || fields.indexOf('histories') > -1) {
            query.populate('histories');
        }
    }

    private queryExcludeIds(query: Query<KolUser>, params: object) {
        var excludeIds: Array<string> = [];

        if (params['exclude_ids']) {
            excludeIds = params['exclude_ids'].trim().split(',');
        }
        query.where({ _id: { $nin: excludeIds } });
    }

    private queryFilter(query: Query<KolUser>, params: object) {
        const filterMapping = {
            range: {
                follower_range: 'facebook.analytic.total_follower',
                avg_range: 'facebook.analytic.avg_engagement_last_3_month',
                dob_range: 'kol_info.kol_info.dob',
                rate_range: 'num_rate'
            },
            select: {
                number: {
                    sex: 'kol_info.sex',
                    kol_info_status: 'kol_info.status',
                    matrimony: 'kol_info.matrimony',
                    num_child: 'kol_info.num_child'
                }
            },
            mutiple: {
                share_story: 'kol_info.share_story',
                job: 'kol_info.job',
                post_frequency: 'kol_info.evaluate.fb.frequency',
                post_content: 'kol_info.evaluate.fb.content',
                post_style: 'kol_info.evaluate.fb.style',
                post_length: 'kol_info.evaluate.text.length',
                post_interactivity: 'kol_info.evaluate.text.interactivity',
                post_swearing: 'kol_info.evaluate.text.swearing_happy',

                image_content: 'kol_info.evaluate.image.content',
                image_scenery: 'kol_info.evaluate.image.scenery',
                personal_style: 'kol_info.evaluate.image.personal_style',
                refine_content: 'kol_info.evaluate.image.refine_content',

                influencer_look: 'kol_info.evaluate.general_style.personal_style',
                brand: 'kol_info.evaluate.general_style.brand'
            }
        };

        // range
        Object.keys(filterMapping.range).forEach(key => {
            if (params[key]) {
                const range = params[key].split('_');
                if (range[0]) query.gte(filterMapping.range[key], parseInt(range[0]));
                if (range[1]) query.lte(filterMapping.range[key], parseInt(range[1]));
            }
        });

        // select number
        Object.keys(filterMapping.select.number).forEach(key => {
            if (params[key]) {
                query.where(filterMapping.select.number[key], parseInt(params[key]));
            }
        });

        // mutiple
        Object.keys(filterMapping.mutiple).forEach(key => {
            if (params[key]) {
                const data = params[key].split(',');
                query.in(filterMapping.mutiple[key], data);
            }
        });

        // custom
        if (params['price_range']) {
            const arr = params['price_range'].split('_');
            const obj = {};
            if (arr[0]) {
                obj['$gte'] = arr[0];
            }

            if (arr[1]) {
                obj['$lte'] = arr[1];
            }

            if (params['price_type']) {
                const type = this.getKeyPriceByCode(params['price_type']);
                query.where(`kol_info.price.${type}`, obj);
            } else {
                query.or([
                    { 'kol_info.price.photo': obj },
                    { 'kol_info.price.have_video': obj },
                    { 'kol_info.price.livestream': obj },
                    { 'kol_info.price.share_link': obj }
                ]);
            }
        }

        if (params['location']) {
            const location = getKeyFromText(params['location']);
            query.where({ 'kol_info.evaluate.province': new RegExp(location, 'i') });
        }
        return query;
    }

    // photo, livestream, have_video, share_link
    private getKeyPriceByCode(code: number) {
        if (isString(code)) {
            code = parseInt(code);
        }
        switch (code) {
            case JobType.Photo:
                return 'photo';
            case JobType.Sharelink:
                return 'share_link';
            case JobType.Video:
                return 'have_video';
            case JobType.Livestream:
                return 'livestream';
            default:
                return null;
        }
    }
    /**/
    /**/
}
