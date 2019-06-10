import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { JobInviteModel, JobInviteStatus } from 'App/Models/JobInviteModel';
import { NotFound } from 'System/Error/NotFound';
import { CauserFrom, JobInvite } from 'Database/Schema/JobInviteSchema';
import { Forbidden } from 'System/Error/Forbidden';
import { Job, JobHistoryAction, KolHistoryType } from 'Database/Schema/JobSchema';
import { KolJobService } from 'App/Modules/Job/Services/KolJobService';
import { BadRequest } from 'System/Error/BadRequest';
import { Query } from 'mongoose';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { KolUserModel } from 'App/Models/KolUserModel';
import * as _ from 'lodash';

interface IDataJoinJob {
    time: string;
    questions: [{ id: string; answer: number }];
}

@Injectable
export class KolInviteService {
    constructor(
        readonly mongo: Mongo,
        readonly jobInviteModel: JobInviteModel,
        readonly kolJobProvider: KolJobService,
        readonly kolUserModel: KolUserModel
    ) {}

    public async joinJob(kId: string, inviteId: string, data: IDataJoinJob) {
        const invite = <JobInvite>await this.jobInviteModel.findById(inviteId).populate('job_id').populate('kol_id');
        const kol = <KolUser>invite.kol_id;
        if (!invite) throw new NotFound('INVITE_NOT_FOND');
        if (kol._id != kId) throw new Forbidden('NOT_PERMISSION_TO_INVITE');
        if (invite.status != JobInviteStatus.Raw) throw new Forbidden('JOB_INVITE_STATUS_NOT_RAW');

        const job = <Job>invite.job_id;
        this.checkRequireJoinJob(job, data);
        return this.mongo.transaction(async session => {
            this.addKolHistory(job, kId, KolHistoryType.AcceptInvite);
            const result =  this.kolJobProvider.createJobByInviteJob(invite, data.time, session);
            if (result) {
                kol['job']['invite']['count'] -= 1;
                kol['job']['running']['count'] += 1;
                await kol.save({ session: session });
            }
            return result;
        });
    }

    public getInviteList(kId: string) {
        return this.queryPopulate(this.jobInviteModel.find({ kol_id: kId, status: JobInviteStatus.Raw }));
    }

    public getDetailInvite(kId: string, inviteId: string) {
        return this.queryPopulate(this.jobInviteModel.find({kol_id: kId, _id: inviteId}));
    }

    private addKolHistory(job: Job, kolId: string, type: number) {
        const kolHistories = job.kol_histories ? job.kol_histories : [];
        const kolHistory = kolHistories.find(h => h.kol_id.toString() == kolId);

        if (kolHistory) {
            kolHistory.histories.push({
                time: new Date(),
                type: type
            });
        } else {
            kolHistories.push({
                kol_id: kolId,
                histories: [
                    {
                        time: new Date(),
                        type: type
                    }
                ]
            });
        }
    }

    private queryPopulate(query: Query<any>) {
        return query
            .populate('kol_id', ['email', 'facebook.name', 'facebook.entity_id', 'facebook.analytic', 'kol_info.phone'])
            .populate({
                path: 'job_id',
                select: ['-invites', '-kol_jobs', '-groups'],
                populate: [
                    {
                        path: 'assign_brand',
                        select: ['email', 'name']
                    }
                ]
            });
    }

    private checkRequireJoinJob(job: Job, data: IDataJoinJob) {
        job.questions.forEach(_q => {
            if (!data.questions.find(q => q.id == _q._id)) {
                throw new BadRequest({ fields: { questions: 'ANSWER_NOT_CORRECT' } });
            }
        });

        const time = job.time.find(t => t._id == data.time);
        if (!time) throw new NotFound('TIME_NOT_FOUND');
        const timeJoin = job.statistic.post_time.find(t => t['id'] == time._id);
        var numJoin = 0;
        if (timeJoin) {
            numJoin = timeJoin['count'];
        }
        if (time.limit <= numJoin) {
            throw new BadRequest({ fields: { time: 'TIME_EMPTY' } });
        }

        if (timeJoin) {
            timeJoin['count'] +=1;
        } else {
            job.statistic.post_time.push({id: time._id, count: 1});
        }
    }

    public async rejectInvite(causerId: string, inviteId: string, reason: string) {
        const invite = await this.jobInviteModel.findOne({
            _id: inviteId,
            kol_id: causerId,
            status: JobInviteStatus.Raw
        }).populate('job_id');

        if (!invite) throw new NotFound('NOT_FOUND_INVITE');
        if (invite.status != JobInviteStatus.Raw) throw new Forbidden('ENABLE_WITH_RAW_STATUS');
        return this.mongo.transaction(async session => {
            invite.status = JobInviteStatus.Reject;
            invite.histories.push({
                current_status: JobInviteStatus.Raw,
                status: JobInviteStatus.Reject,
                reason: reason,
                from: CauserFrom.Admin
            });
            const job = <Job>invite.job_id;

            job.histories.push({
                type: JobHistoryAction.RejectInvite,
                job_status: job.status,
                data: [inviteId],
                time: new Date()
            });
            this.addKolHistory(job, invite.kol_id.toString(), KolHistoryType.RejectInvite);
            job.save({ session: session });

            const kol = await this.kolUserModel.findById(causerId);
            if (kol) {
                const count = await this.jobInviteModel.find({kol_id: causerId, status: JobInviteStatus.Raw}).count() - 1;
                _.set(kol, 'job.invite.count', count > 0 ? count : 0);
                await kol.save({ session: session});
            }

            return invite.save({ session: session });
        });
    }
}
