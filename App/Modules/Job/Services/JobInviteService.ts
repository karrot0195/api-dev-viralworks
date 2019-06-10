import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { JobModel, JobStatus } from 'App/Models/JobModel';
import { JobInviteModel, JobInviteStatus } from 'App/Models/JobInviteModel';
import { NotFound, BadRequest, Forbidden, InternalError } from 'System/Error';
import { Config } from 'System/Config';
import { Job, JobHistoryAction, KolHistoryType } from 'Database/Schema/JobSchema';
import { KolUserModel } from 'App/Models/KolUserModel';
import { MailType } from 'App/Models/MailModel';
import { MailService } from 'App/Modules/Admin/Services/MailService';
import { CauserFrom } from 'Database/Schema/JobInviteSchema';
import * as _ from 'lodash';

@Injectable
export class JobInviteService {
    private kolInvites: Array<string>;
    private jobCurrent: Job;
    private priceMapping: object;

    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _jobModel: JobModel,
        private readonly _jobInviteModel: JobInviteModel,
        private readonly _kolModel: KolUserModel,
        private readonly _mailService: MailService
    ) {}

    public async sendInvite(causerId: string, jobId: string, sendMail: boolean) {
        const Job = await this._jobModel.findOne({
            _id: jobId,
            status: {
                $in: [JobInviteStatus.Raw, JobInviteStatus.Join]
            }
        }).populate('invites', 'kol_id');
        if (!Job) throw new NotFound('JOB_NOT_FOUND');
        this.jobCurrent = Job;
        this.getListKolIdInvite();
        Job.status = JobStatus.Running;
        if (!Job.histories) Job.histories = [];

        Job.histories.push({
            type: JobHistoryAction.Invite,
            time: new Date(),
            job_status: Job.status,
            causer_id: causerId,
            data: this.kolInvites
        });
        return this.inviteKols(causerId, sendMail);
    }

    public async inviteDetail(invite_id) {
        return this._jobInviteModel
            .findById(invite_id)
            .populate('kol_id', ['email', 'facebook.name', 'facebook.entity_id'])
            .populate('job_id');
    }

    public async rejectInvite(causerId: string, inviteId: string, reason: string) {
        const invite = await this._jobInviteModel.findById(inviteId).populate('job_id');
        if (!invite) throw new NotFound('NOT_FOUND_INVITE');
        if (invite.status != JobInviteStatus.Raw) throw new Forbidden('ENABLE_WITH_RAW_STATUS');
        return this._mongo.transaction(async session => {
            invite.status = JobInviteStatus.Reject;
            invite.histories.push({
                current_status: JobInviteStatus.Raw,
                status: JobInviteStatus.Reject,
                reason: reason,
                causer_id: causerId,
                from: CauserFrom.Admin
            });
            const job = <Job>invite.job_id;

            job.histories.push({
                causer_id: causerId,
                type: JobHistoryAction.RejectInvite,
                job_status: job.status,
                data: [inviteId],
                time: new Date()
            });

            this.addKolHistory(causerId, job, invite.kol_id.toString(), KolHistoryType.RejectInvite);

            job.save({ session: session });

            // update count job
            const kol = await this._kolModel.findById(invite.kol_id.toString());
            if (kol) {
                const count = await this._jobInviteModel.find({kol_id: invite.kol_id.toString(), status: JobInviteStatus.Raw}).count() - 1;
                _.set(kol, 'job.invite.count', count > 0 ? count : 0);
                await kol.save({ session: session});
            }

            return invite.save({ session: session });
        });
    }

    public async reinviteKol(causerId: string, inviteId: string) {
        const invite = await this._jobInviteModel.findById(inviteId).populate('job_id');
        if (!invite) throw new NotFound('NOT_FOUND_INVITE');
        if (invite.status != JobInviteStatus.Reject) throw new Forbidden('ENABLE_WITH_REJECT_STATUS');
        return this._mongo.transaction(async session => {
            invite.status = JobInviteStatus.Raw;
            invite.histories.push({
                current_status: JobInviteStatus.Reject,
                status: JobInviteStatus.Raw,
                causer_id: causerId,
                from: CauserFrom.Admin
            });
            await this._mailService.sendMailTemplateKol(causerId, <string>invite.kol_id, MailType.INVITE_JOB, {
                invite_id: inviteId
            });

            const job = <Job>invite.job_id;

            job.histories.push({
                causer_id: causerId,
                type: JobHistoryAction.ReInviteKol,
                job_status: job.status,
                data: [inviteId],
                time: new Date()
            });

            this.addKolHistory(causerId, job, invite.kol_id.toString(), KolHistoryType.Reinvite);

            job.save({ session: session });

            const kol = await this._kolModel.findById(invite.kol_id.toString());
            if (kol) {
                const count = await this._jobInviteModel.find({kol_id: invite.kol_id.toString(), status: JobInviteStatus.Raw}).count() + 1;
                _.set(kol, 'job.invite.count', count > 0 ? count : 0);
                await kol.save({ session: session});
            }

            return invite.save({ session: session });
        });
    }

    /*PRIVATE REGION*/
    private getListKolIdInvite() {
        let kolInviteds: Array<any> = this.jobCurrent['invites'].map(invite => <string>invite['kol_id']);
        let kols: Array<string> = [];
        this.priceMapping = {};

        this.jobCurrent.groups.forEach(group => {
            group.kols.forEach(kol_id => {
                const kolId = kol_id.toString();
                if (!kolInviteds.find(kol_id => kol_id == kolId)) {
                    kols.push(kolId);
                    this.priceMapping[kolId] = group.price;
                }
            });
        });
        this.kolInvites = kols;
    }

    private addKolHistory(causerId: string, job: Job, kolId: string, type: number) {
        const kolHistories = job.kol_histories ? job.kol_histories : [];
        const kolHistory = kolHistories.find(h => h.kol_id.toString() == kolId);

        if (kolHistory) {
            kolHistory.histories.push({
                time: new Date(),
                causer_id: causerId,
                type: type
            });
        } else {
            kolHistories.push({
                kol_id: kolId,
                histories: [
                    {
                        time: new Date(),
                        causer_id: causerId,
                        type: type
                    }
                ]
            });
        }
    }

    private checkInviteKols() {
        if (this.inviteKols.length == 0) throw new BadRequest({ fields: { job: 'KOL_INVITE_EMPTY' } });
    }

    private async inviteKols(causerId: string, sendMail: boolean) {
        this.checkInviteKols();
        const success: Array<string> = [];
        const fail: Array<string> = [];
        const doingInvites = async () => {
            for (let i = 0; i < this.kolInvites.length; i++) {
                const kolId = this.kolInvites[i];
                const result = await this.inviteKol(causerId, kolId, sendMail);
                if (result) {
                    this.addKolHistory(causerId, this.jobCurrent, kolId.toString(), KolHistoryType.Invite);
                    success.push(kolId);
                } else {
                    fail.push(kolId);
                }
            }
        };
        await doingInvites();
        await this.triggerUploadCountJob(success);
        await this.jobCurrent.save();

        return {
            success: success,
            fail: fail
        };
    }

    private async triggerUploadCountJob(kIds: Array<string>) {
        for (const kId of kIds) {
            const getCountInvite = async (kol_id: string) => {
                return new Promise(res => {
                    this._jobInviteModel.count({ kol_id: kol_id, status: JobInviteStatus.Raw }, (err, num) => {
                        res(num);
                    });
                });
            };
            const num = await getCountInvite(kId);
            await this._kolModel.updateOne({ _id: kId }, <any>{ 'job.invite.count': num });
        }
    }

    private async inviteKol(causerId: string, kolId: string, sendMail: boolean) {
        try {
            const kol = await this._kolModel.findById(kolId);
            if (!kol) return false;

            // create job invite data
            return await this._mongo.transaction(async session => {
                const price = this.priceMapping[kolId] ? this.priceMapping[kolId] : 0;

                const jobInvite = await this._jobInviteModel.create(
                    {
                        kol_id: kolId,
                        job_id: this.jobCurrent._id,
                        price: price
                    },
                    session
                );

                const Job = await this._jobModel.findById(<string>jobInvite.job_id);
                if (!Job) return false;
                Job.invites.push(jobInvite._id);

                await Job.save({ session });

                if (jobInvite) {
                    if (sendMail) {
                        await this._mailService.sendMailTemplateKol(causerId, kolId, MailType.INVITE_JOB, {
                            invite_id: jobInvite._id
                        });
                    }
                    return true;
                }
                return false;

            });
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    /**/
}
