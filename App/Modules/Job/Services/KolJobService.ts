import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import {
    KolJobModel,
    IKolJob,
    SearchField,
    IKolJobPost,
    KolJobAction,
    KolJobStatus,
    KolJobPostStatus
} from 'App/Models/KolJobModel';
import { JobInviteModel, JobInviteStatus } from 'App/Models/JobInviteModel';
import { NotFound, BadRequest, InternalError, Forbidden } from 'System/Error';
import { JobInvite } from 'Database/Schema/JobInviteSchema';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { Job } from 'Database/Schema/JobSchema';
import { ClientSession } from 'mongodb';
import { Query } from 'mongoose';
import { KolJob } from 'Database/Schema/KolJobSchema';
import { KolJobStateContext } from 'Facade/JobPostState/KolJobStateContext';
import { MailType } from 'App/Models/MailModel';
import { KolJobPaymentState } from 'Facade/JobPostState/Classes/KolJobPaymentState';
import { HistoryActionModel, HistoryActionType } from 'App/Models/HistoryActionModel';
import { MailService } from 'App/Modules/Admin/Services/MailService';

import * as _ from 'lodash';
import { JobType } from 'App/Models/JobModel';

interface IEvaluate {
    rating: number;
    comment: string;
    cheat: boolean;
}

@Injectable
export class KolJobService {
    private _fieldKol: Array<string> = ['email', 'facebook', 'kol_info.mobile', 'income', 'histories', 'job', 'rate'];
    private _fieldJob: Array<string> = ['title', 'status', 'assgin_brand', 'description', 'type', 'time'];

    constructor(
        private readonly _mongo: Mongo,
        private readonly _kolJobModel: KolJobModel,
        private readonly _inviteJobModel: JobInviteModel,
        private readonly _jobStateContext: KolJobStateContext,
        private readonly _mailService: MailService,
        private readonly _historyActionModel: HistoryActionModel
    ) {}

    public async findById(kolJobId: string) {
        const kolJob = await this.embedQueryPopulate(<Query<IKolJob>>this._kolJobModel.findById(kolJobId));
        if (!kolJob) throw new NotFound('KOL_JOB_NOT_FOUND');
        return kolJob;
    }

    public async findKolJobByCondition(condition: object) {
        const beforeExcuteQuery = async (query: Query<IKolJob>) => {
            this.embedQueryPopulate(query);
        };
        const hookAction = { beforeExcuteQuery: beforeExcuteQuery };
        return this._kolJobModel.findWithFilter(condition, SearchField, hookAction);
    }

    public async createKolJobByInviteId(invteId: string, timeId: string) {
        const inviteJob = await this.findInviteRawJobById(invteId);
        return this._mongo.transaction(async session => {
            return await this.createJobByInviteJob(inviteJob, timeId, session);
        });
    }

    public async createJobByInviteJob(inviteJob, time: string, session) {
        await this.updateJoinInviteJob(inviteJob, session);
        return await this.createJobByInvite(inviteJob, time, session);
    }

    public async updatePostData(kolJobId: string, data: IKolJobPost) {
        const kolJob = <KolJob>await this.findById(kolJobId);
        Object.keys(data).forEach(k => {
            kolJob.post[k] = data[k];
        });
        return kolJob.save();
    }

    public async updateStatePost(causerId: string, kolJobId: string, action: string, data?: object) {
        const kolJob = <KolJob>await this.findById(kolJobId);
        if (kolJob.status != KolJobStatus.Active) throw new Forbidden('KOL_JOB_ENABLE_WITH_ACTIVE');
        // setting for state
        this._jobStateContext.setRequireOption(kolJob, causerId);
        this._jobStateContext.applyCurrentOption();
        if (action == 'accept') {
            return this._jobStateContext.accept();
        } else if (action == 'reject') {
            if (!data || !data['reason']) throw new BadRequest({ fields: { reason: 'REASON_FIELD_REQUIRED' } });
            return await this._jobStateContext.reject(data['reason']);
        }
    }

    public async closeJob(causerId: string, kolJobId: string, data: IEvaluate) {
        const kolJob = <KolJob>await this.findById(kolJobId);
        if (kolJob.status != KolJobStatus.Active) throw new Forbidden('KOL_JOB_ENABLE_WITH_ACTIVE');

        return this._mongo.transaction(async session => {
            const { message_id } = await this.sendMailCloseJob(causerId, kolJob, session);
            await this.evaluateKolJob(causerId, kolJob, message_id, data, session);

            const kol = <KolUser>kolJob.kol_id;
            if (kol.job) {
                if (kol.job.running) {
                    kol.job.running.count = kol.job.running.count - 1;
                }

                if (kol.job.completed) {
                    kol.job.completed.count = kol.job.completed.count + 1;
                }
            }

            // evaluate
            let rate: any = {
                evaluate: {
                    count: _.get(kol.rate, 'evaluate.count', 0)
                },
                num: _.get(kol.rate, 'num', 0)
            };

            rate.num = (rate.num * rate.evaluate.count + data.rating) / (rate.evaluate.count + 1);
            rate.evaluate.count = rate.evaluate.count + 1;
            kol.rate = rate;

            if (!data.cheat) {
                await this.updateIncomePending(causerId, kolJob, session);
            } else {
                await kol.save({ session });
            }
            return true;
        });
    }
    public async updateStateBlockJob(causerId: string, kJobId: string, state: boolean) {
        const kolJob = <KolJob>await this.findById(kJobId);
        if (!kolJob) throw new NotFound('KOL_JOB_NOT_FOUND');
        kolJob.is_block = state;
        let historyItem: any = {
            causer_id: causerId,
            job_post_status: kolJob.post.status,
            job_status: kolJob.status,
        };

        if (state) {
            historyItem.type = KolJobAction.Block;
        } else {
            historyItem.type = KolJobAction.Unblock;
        }
        kolJob.histories.push(historyItem);
        return kolJob.save();
    }

    public async updateStatePayment(causerId: string, kolJobId: string, action: string, data?: any) {
        const kolJob = <KolJob>await this.findById(kolJobId);
        if (kolJob.evaluate.cheat) throw new Forbidden('JOB_CHEAT');
        if (kolJob.status != KolJobStatus.CloseJob) throw new Forbidden('JOB_ENABLE_WITH_CLOSE');

        this._jobStateContext.setState(new KolJobPaymentState());
        this._jobStateContext.setRequireOption(kolJob, causerId);

        if (action == 'accept') {
            return this._jobStateContext.accept();
        } else if (action == 'reject') {
            if (!data.reason) throw new BadRequest({ fields: { reason: 'REASON_FIELD_REQUIRED' } });
            return this._jobStateContext.reject(data.reason);
        }
        throw new Forbidden('ACTION_NOT_ALLOW');
    }

    public async removeKolJob(kolJobId: string) {
        const result = await this._kolJobModel.deleteOne({ _id: kolJobId });
        return result.deletedCount > 0;
    }

    public async pushNote(kolJobId: string, causerId, note: string) {
        const kolJob = await this._kolJobModel.findById(kolJobId);
        if (!kolJob) throw new NotFound('KOL_JOB_NOT_FOUND');
        kolJob.note.push({
            description: note,
            causer_id: causerId,
            time: new Date()
        });

        return kolJob.save();
    };

    public async changePostTime(causerId: string, kJobId: string, postimeId: string) {
        const kolJob = await this._kolJobModel.findById(kJobId).populate('job_id');
        if (!kolJob) throw new NotFound('KOL_JOB_NOT_FOUND');
        const job = <Job>kolJob.job_id;
        const time1 = job.time.find(t => t._id == kolJob._id);
        const time2 = job.time.find(t => t._id == postimeId);

        if (!time2) throw new NotFound('POST_TIME_NOT_FOUND');

        const statistic1 = job.statistic.post_time.find(t => t['id'] == kolJob._id);
        const statistic2 = job.statistic.post_time.find(t => t['id'] == postimeId);

        if (statistic2 && time2.limit <= statistic2['count']) {
            throw new Forbidden('TIME_EMPTY');
        }

        if (statistic1) {
            if (statistic1['count'] && statistic1['count'] > 0) {
                statistic1['count'] -= 1;
            } else {
                statistic1['count'] = 0;
            }
        }

        if (statistic2) {
            statistic2['count'] += 1;
        } else {
            job.statistic.post_time.push({
                id: time2._id,
                count: 1
            });
        }

        return this._mongo.transaction(async session => {
            job.save({ session: session });
            kolJob.time = <string>time2._id;
            return kolJob.save({session:session});
        });
    }

    /* Private Func */
    private createKolJob(inviteJob: JobInvite, time: string, session?: ClientSession) {
        const data = {
            kol_id: (<KolUser>inviteJob.kol_id)._id,
            job_id: (<Job>inviteJob.job_id)._id,
            time: time,
            price: this.getPriceJob(<Job>inviteJob.job_id, (<KolUser>inviteJob.kol_id)._id)
        };

        if ((<Job>inviteJob.job_id).type == JobType.Sharelink) {
            data['post'] = {
                status: KolJobPostStatus.Content
            };
        }

        return this._kolJobModel.create(<IKolJob>data, session);
    }

    private getPriceJob(job: Job, kolId: string): number {
        let price: number = -1;
        job.groups.forEach(group => {
            const kol = group.kols.find(kol_id => kol_id.toString() == kolId.toString());
            if (kol) {
                price = group.price;
                return;
            }
        });
        if (price > 0) {
            return price;
        }
        throw new InternalError('JOB_PRICE_NOT_FOUND');
    }

    private embedQueryPopulate(query: Query<IKolJob>) {
        query.populate('kol_id', this._fieldKol);
        query.populate('job_id', this._fieldJob);
        query.populate('note.causer_id', ['name', 'email']);
        return query;
    }

    private async findInviteRawJobById(invteId: string) {
        const inviteJob = await this._inviteJobModel
            .findById(invteId)
            .populate('kol_id')
            .populate('job_id');
        if (!inviteJob) throw new NotFound('JOB_INVITE_NOT_FOUND');
        if (!(inviteJob.status == JobInviteStatus.Raw)) throw new Forbidden('JOB_INVITE_STATUS_NOT_RAW');
        return inviteJob;
    }

    private async updateJoinInviteJob(inviteJob: JobInvite, session?: ClientSession) {
        inviteJob.status = JobInviteStatus.Join;
        return inviteJob.save({ session });
    }

    private async createJobByInvite(inviteJob: JobInvite, time: string, session?: ClientSession) {
        const kolJob = await this.createKolJob(inviteJob, time, session);
        const job = <Job>inviteJob.job_id;
        // add kol job to job
        job.kol_jobs.push(kolJob._id);
        await job.save({ session });
        return kolJob;
    }

    private sendMailCloseJob(causerId: string, kolJob: KolJob, session?: ClientSession) {
        const job = <Job>kolJob.job_id;
        const kol = <KolUser>kolJob.kol_id;

        return this._mailService.excuteSendMailKol(
            causerId,
            kol._id,
            MailType.KOL_JOB_CLOSE,
            {
                job_link: '#',
                job_title: job.title
            },
            session
        );
    }

    private async updateIncomePending(causerId: string, kolJob: KolJob, session: ClientSession) {
        const kol = <KolUser>kolJob.kol_id;
        kol.income['pending'] += kolJob.price;
        const history = await this._historyActionModel.create(
            {
                causer_id: causerId,
                kol_id: kol._id,
                ref_id: kolJob._id, // kolJob id
                type: HistoryActionType.Income
            },
            session
        );
        kol.histories.push(history._id);
        return await kol.save({ session });
    }

    private async evaluateKolJob(
        causerId: string,
        kolJob: KolJob,
        message_id: string,
        data: any,
        session?: ClientSession
    ) {
        kolJob.status = KolJobStatus.CloseJob;
        kolJob.evaluate.rating = data.rating;
        kolJob.evaluate.comment = data.comment;
        kolJob.evaluate.cheat = data.cheat;

        kolJob.histories.push({
            causer_id: causerId,
            job_post_status: kolJob.post.status,
            job_status: kolJob.status,
            type: KolJobAction.Accept,
            ref_id: message_id
        });
        await kolJob.save({ session });
    }

    public virtualData(obj: any) {
        const _object = obj.toObject();
        const histories: Array<any> = [];

        histories.push({
            time: _object.created_at,
            message: 'Tham gia chiến dịch'
        });

        if (_object.histories && _object.histories.length) {
            _object.histories.forEach(h => {
                if (h.job_status == 1) {
                    const label = ['tham gia', 'nội dung', 'đường dẫn'];
                    let state = h.job_post_status;
                    let message = '';
                    if (h.type == 1) {
                        message = `Chấp nhận ${label[state - 1]}`;
                    } else {
                        message = `Từ chối ${label[state]}`;
                    }

                    histories.push({ time: h.time, message: message });
                } else if (h.job_status == 2) {
                    histories.push({ time: h.time, message: 'Kết thúc' });
                } else if (h.job_status == 3) {
                    histories.push({ time: h.time, message: 'Chấp nhận thanh toán' });
                } else if (h.job_status == 3) {
                    histories.push({ time: h.time, message: 'Từ chối thanh toán' });
                }
            });
        }
        _object['data_histories'] = histories;
        return _object;
    }
    /**/
}
