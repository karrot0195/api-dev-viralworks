import { Injectable } from 'System/Injectable';
import { JobModel, IJob, SearchField, FieldNotAllow, JobStatus } from 'App/Models/JobModel';
import { Mongo } from 'System/Mongo';
import { FileStorage } from 'System/FileStorage';
import { BadRequest, NotFound, Forbidden, InternalError } from 'System/Error';
import { ImageMIME } from 'System/Enum/MIME';
import { IGroupItem, ITimeItem } from 'App/Constants/Models/Job/IJobItem';
import { Job, JobHistoryAction, KolHistoryType } from 'Database/Schema/JobSchema';
import { GroupItem } from 'App/Constants/Schema/Job/JobItem';
import { AttachmentService } from 'App/Modules/Attachment/Services/AttachmentService';
import { ModelPopulateOptions, Query } from 'mongoose';
import { KolUserModel, SELECT_BASIC_DATA } from 'App/Models/KolUserModel';
import { KolJob } from 'Database/Schema/KolJobSchema';
import { KolJobModel, KolJobStatus } from 'App/Models/KolJobModel';
import * as _ from 'lodash';
import { CauserFrom, JobInvite } from 'Database/Schema/JobInviteSchema';
import { JobInviteModel, JobInviteStatus } from 'App/Models/JobInviteModel';
import { getInfoPost } from 'Facade/SocialiteProvider/Helper/FacebookHelper';
import { PostLinkCommand } from 'App/Command/PostLinkCommand';
import { JobSeedCommand } from 'App/Command/JobSeedCommand';
import { FinishJobCommand } from 'App/Command/FinishJobCommand';
import { CategoryShareStoryModel } from 'App/Models/CategoryShareStoryModel';
import { CategoryJobModel } from 'App/Models/CategoryJobsModel';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { showDebug } from 'App/Helpers/Generator';

export interface IOptionFix {
    includes?: Array<string>;
    excludes?: Array<string>;
}

interface IJobStats {
    post: number;
    buzz: number;
    engagement: number;
    reaction: number;
    comment: number;
    share: number;
    approved_content_post: number;
    approved_link_post: number;
    completed_post: number;
    kol_count: number;
    timeline: {
        [prop: string]: {
            register: number;
            done: number;
        };
    };
}

export interface IOngoingJobSimple {
    kol_count: number;
    post_count: number;
    accept_count: number;
}

@Injectable
export class JobService {
    constructor(
        private readonly _mongo: Mongo,
        private readonly _jobModel: JobModel,
        private _storage: FileStorage,
        private _attachmentProvider: AttachmentService,
        private _kolModel: KolUserModel,
        private _kolJobModel: KolJobModel,
        private _jobInviteModel: JobInviteModel,
        private _kolUserModel: KolUserModel,
        private commandPostLink: PostLinkCommand,
        private commandJobSeed: JobSeedCommand,
        private finishJobCommand: FinishJobCommand,
        private categoryJobModel: CategoryJobModel,
        private categoryShareStoryModel: CategoryShareStoryModel
    ) {}

    /* CREATE */
    public async createJob(data: object) {
        // check hashtags
        if (data['hashtags']) {
            const match = /[a-zA-Z0-9_]/g;
            for (let i = 0; i < data['hashtags'].length; i++) {
                data['hashtags'][i] = `#${data['hashtags'][i].match(match).join('')}`;
            }
        }

        const cover_image = data['cover_image'];
        const sample_post = data['sample_post'];
        data = this.fixParams(data, { excludes: FieldNotAllow });
        return this._mongo.transaction(async session => {
            const job = await this._jobModel.create(<IJob>data, session);

            const uploadAttachmentJob = async (fileName, fieldName) => {
                if (fileName) {
                    await this._attachmentProvider.uploadAttachmentFromTemp(fileName, `job/${job._id}`, fieldName);
                    job[fieldName] = true;
                } else {
                    job[fieldName] = false;
                }
            };

            await uploadAttachmentJob(cover_image, 'cover_image');
            await uploadAttachmentJob(sample_post, 'sample_post');
            return await job.save();
        });
    }

    public async addGroup(causerId: string, jobId: string, data: IGroupItem) {
        const job = await this.checkBeforeAddGroup(jobId, data);
        job.groups.push(data);
        if (data.kols) {
            data.kols.forEach(k => {
                this.addKolHistory(causerId, job, k.toString(), KolHistoryType.Add);
            });
        }
        job.groups = job.groups.sort((a, b) => (a.tag > b.tag ? 1 : -1));
        return this.triggerLocation(job);
    }

    public async addKols(causerId: string, jobId: string, groups: Array<GroupItem>) {
        const job = await this.getJobById(jobId);
        groups.forEach(g => {
            const _group = job.groups.find(_g => _g.tag == g.tag);
            if (_group) {
                _group.kols = _group.kols.concat(
                    g.kols.filter(kId => {
                        if (!this.checkExistKol(<string>kId, job)) {
                            this.addKolHistory(causerId, job, kId.toString(), KolHistoryType.Add);
                            return true;
                        }
                        return false;
                    })
                );
            }
        });
        return this.triggerLocation(job);
    }

    /**/

    /* GET */
    public findCondition(condition: object) {
        const embeddeds: Array<any> = [];
        if (condition['embedded']) {
            (<string>condition['embedded']).split(',').forEach(k => {
                const embedded = this.embeddedJob(k);
                if (embedded) {
                    embeddeds.push(embedded);
                }
            });
        }
        return this._jobModel.findWithFilter(
            condition,
            SearchField,
            {
                beforeExcuteQuery: (query: Query<Job>) => {
                    if (condition['status']) {
                        const range: Array<string> = condition['status'].split(',');
                        query.where({ status: { $in: range } });
                    }
                },
                beforeResultData: async data => {
                    const results = data.results;
                    const arr: Array<any> = [];
                    if (results) {
                        for (const row of results) {
                            arr.push(await this.getStatisticInfoJob(row));
                        }
                    }
                    data.results = arr;
                }
            },
            embeddeds
        );
    }

    public async getStatisticInfoJob(job: Job) {
        const obj = job.toObject();
        // take invite info
        const numInviteAccept = obj.kol_jobs.length;
        const rejectInvites = await this._jobInviteModel.find({
            job_id: obj._id,
            status: JobInviteStatus.Reject
        });

        let numRejectInvite = 0,
            numDeniedInvite = 0;
        if (rejectInvites) {
            for (const invite of rejectInvites) {
                const history = invite.histories[invite.histories.length - 1];
                if (history && history.causer_id) {
                    numDeniedInvite++;
                } else {
                    numRejectInvite++;
                }
            }
        }

        const kJobs = await this._kolJobModel
            .find({
                job_id: obj._id
            })
            .select(['status', 'is_block', 'kol_id'])
            .populate('kol_id', ['location', 'kol_info.evaluate.province']);

        let numJobComplete = 0,
            numJobBlock = 0,
            numJobAccpetPayment = 0,
            numJobRejectPayment = 0;
        if (kJobs) {
            for (const kJob of kJobs) {
                if (kJob.status >= KolJobStatus.CloseJob) numJobComplete++;
                if (kJob.status == KolJobStatus.Payment) numJobAccpetPayment++;
                if (kJob.status == KolJobStatus.RejectPayment) numJobRejectPayment++;
                if (kJob.is_block) numJobBlock++;
            }
        }
        obj.statistic['job_info'] = {
            invite: {
                accept: numInviteAccept,
                reject: numRejectInvite,
                denied: numDeniedInvite,
                pending: obj.invites.length - numInviteAccept
            },
            kol_jobs: {
                complete: numJobComplete,
                block: numJobBlock,
                accept_payment: numJobAccpetPayment,
                reject_payment: numJobRejectPayment
            }
        };
        let locationStatistic: Array<any> = [];
        const handleKolLocation = (kol: KolUser) => {
            let location = '';
            if (kol.location) {
                location = kol.location;
            } else {
                location = _.get(kol, 'kol_info.evaluate.province');
            }

            if (location) {
                const l = locationStatistic.find(obj => obj.id == location);
                if (l) {
                    l.count++;
                } else {
                    locationStatistic.push({
                        count: 1,
                        id: location
                    });
                }
            } else {
                const l = locationStatistic.find(obj => obj.id == 'other');
                if (l) {
                    l.count++;
                } else {
                    locationStatistic.push({
                        count: 1,
                        id: 'other'
                    });
                }
            }
        };

        // virtual group
        if (obj.groups.length) {
            let kIds: Array<string> = [];
            if (kJobs) {
                kIds = kJobs.reduce((arr: Array<string>, kJob: KolJob) => {
                    const kol = <KolUser>kJob.kol_id;
                    if (kol) {
                        arr.push(kol._id.toString());
                        // handle location
                        handleKolLocation(kol);
                    }
                    return arr;
                }, []);
            }

            for (const g of obj.groups) {
                let num = 0;
                if (g.kols && kIds) {
                    num = g.kols.filter(gKol => {
                        let gKId = '';
                        if (gKol._id) {
                            gKId = gKol._id.toString();
                        } else {
                            gKId = gKol.toString();
                        }
                        return kIds.find(kId => kId == gKId);
                    }).length;
                }

                g.join = num;
            }
        }

        // virtual location kol job
        obj.statistic.kol_job_location = locationStatistic;
        return obj;
    }

    public async getKols(jobId: string, params: any) {
        const job = await this._jobModel
            .findById(jobId)
            .populate('invites')
            .populate('kol_jobs', ['status', 'is_block', 'post', 'kol_id', 'time', 'price'])
            .populate('groups.kols', ['email', 'kol_info.job', 'kol_info.share_story', 'summary_info', 'facebook']);
        if (!job) throw new NotFound('JOB_NOT_FOUND');
        let data: Array<any> = [];

        const fixData = function(kol) {
            if (statistic['pending'].find(i => i == kol._id.toString())) {
                kol['job_status'] = 1;
            } else if (statistic['invite'].find(i => i == kol._id.toString())) {
                kol['job_status'] = 2;
            } else if (statistic['join'].find(i => i == kol._id.toString())) {
                kol['job_status'] = 3;
                kol['job'] = (<KolJob[]>job.kol_jobs).find(kJob => {
                    return kJob.kol_id.toString() == kol._id.toString();
                });
            } else if (statistic['reject'].find(i => i == kol._id.toString())) {
                kol['job_status'] = -1;
            } else {
                kol['job_status'] = null;
            }

            const invite = invites.find(i => i.kol_id.toString() == kol['_id'].toString());
            if (invite) {
                kol['invite_id'] = invite._id;
            }

            let kolHistory: Array<any> = [];
            if (job.kol_histories) {
                const data = job.kol_histories.find(h => h.kol_id.toString() == kol['_id'].toString());
                if (data) {
                    kolHistory = data.histories;
                }
            }
            kol['kol_history'] = kolHistory;
            return kol;
        };

        const listKolId: Array<string> = job.groups.reduce((arr: Array<string>, group: any) => {
            if (group.kols) {
                for (const kol of group.kols) {
                    let obj = kol.toObject();
                    obj.group = {
                        tag: group.tag,
                        price: group.price
                    };

                    data.push(obj);
                    arr.push(kol._id.toString());
                }
            }
            return arr;
        }, []);

        const statistic: object = {
            pending: [],
            invite: [],
            reject: [],
            join: [],
            process: []
        };

        // STATISTICpost_time
        const invites = <JobInvite[]>job.invites;
        invites.map(invite => {
            statistic['process'].push(<string>invite.kol_id);
            switch (invite.status) {
                case JobInviteStatus.Raw:
                    statistic['invite'].push(<string>invite.kol_id);
                    break;
                case JobInviteStatus.Join:
                    statistic['join'].push(<string>invite.kol_id);
                    break;

                case JobInviteStatus.Reject:
                    statistic['reject'].push(<string>invite.kol_id);
                    break;
            }
        });

        statistic['pending'] = listKolId.filter(k => !statistic['process'].find(p => p.toString() == k.toString()));

        // PROCESS DATA
        data = data.reduce((arr: Array<any>, obj: any) => {
            let check = true;
            obj = fixData(obj);
            if (params.kol_job_status) {
                check = false;
                if (obj.job && params.kol_job_status.split(',').find(s => <number>s == <number>obj.job.status)) {
                    check = true;
                }
            }

            if (params.post_time) {
                check = false;
                if (obj.job && obj.job['time'] == params.post_time) {
                    check = true;
                }
            }

            if (params.post_status) {
                check = false;
                if (obj.job && params.post_status.split(',').find(s => <number>s == <number>obj.job.post.status)) {
                    check = true;
                }
            }

            if (params.post_request) {
                check = false;
                if (obj.job && params.post_request.split(',').find(s => <number>s == <number>obj.job.post.request)) {
                    check = true;
                }
            }

            if (params.kol_job_block) {
                let block = false;
                if (params.kol_job_block == 1) {
                    block = true;
                }
                check = false;
                if (obj.job && obj.job.is_block == block) {
                    check = true;
                }
            }

            if (params.status) {
                const arrStatus = params.status.split(',');
                check = false;
                if (arrStatus.find(s => s.toString() == obj.job_status.toString())) {
                    check = true;
                }
            }

            if (params.group) {
                check = false;
                if (obj.group.tag == params.group) {
                    check = true;
                }
            }

            if (params.text) {
                check = false;
                const textSearch = params.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (obj.summary_info && obj.summary_info.match(new RegExp(textSearch))) {
                    check = true;
                }
            }

            if (check) {
                arr.push(obj);
            }
            return arr;
        }, []);

        const limit = params.limit;
        const offset = params.page * params.limit;
        const total = data.length;

        data = data.splice(offset, limit);

        return {
            total: total,
            results: data,
            limit: limit,
            page: params.page,
            from: offset,
            to: offset + limit < total ? offset + limit : total,
            lastpage: Math.round(total / limit),
            statistic: {
                pending: statistic['pending'].length,
                invite: statistic['invite'].length,
                reject: statistic['reject'].length,
                join: statistic['join'].length,
                process: statistic['process'].length
            }
        };
    }

    private embeddedJob(field) {
        switch (field) {
            case 'kol_group':
                return <ModelPopulateOptions>{
                    path: 'groups.kols',
                    select: SELECT_BASIC_DATA
                };
                break;
            case 'manager_by':
                return <ModelPopulateOptions>{
                    path: 'manager_by',
                    select: ['email', 'name', 'code']
                };
                break;
            case 'assign_brand':
                return <ModelPopulateOptions>{
                    path: 'assign_brand',
                    select: ['email', 'name']
                };
                break;
            case 'groups_reference':
                return <ModelPopulateOptions>{
                    path: 'groups_reference'
                };
                break;
            case 'kol_jobs':
                return <ModelPopulateOptions>{
                    path: 'kol_jobs'
                };
                break;
            case 'invites':
                return <ModelPopulateOptions>{
                    path: 'invites'
                };
                break;
            case 'kol_histories':
                return <ModelPopulateOptions>{
                    path: 'kol_histories',
                    populate: {
                        path: 'kol_id'
                    }
                };
                break;
            default:
                return null;
        }
        return null;
    }

    public findById(jobId: string, embedded?: string) {
        const embeddeds: Array<any> = [];
        if (embedded) {
            (<string>embedded).split(',').forEach(k => {
                const emOption = this.embeddedJob(k);
                if (emOption) {
                    embeddeds.push(emOption);
                }
            });
        }
        return this._jobModel.findById(jobId).populate(embeddeds);
    }

    public async getAttachment(jobId: string, fieldName: string) {
        const filePath = await this._storage.getAbsoluteFilePath('job/' + jobId, fieldName);
        if (!await this._storage.checkFileExist(filePath)) throw new NotFound('ATTCHMENT_NOT_FOUND');
        return this._storage.renderFile(filePath);
    }
    /**/

    /* UPDATE */
    public async updateJob(jobId: string, data: object) {
        const cover_image = data['cover_image'];
        const sample_post = data['sample_post'];

        data = this.fixParams(data, {
            excludes: FieldNotAllow
        });
        return this._mongo.transaction(async session => {
            const uploadAttachmentJob = async (fileName, fieldName) => {
                if (fileName) {
                    try {
                        await this._attachmentProvider.uploadAttachmentFromTemp(fileName, `job/${jobId}`, fieldName);
                    } catch (err) {
                        if (err.status == 404) {
                            const fields = {};
                            fields[fieldName] = `${fieldName.toUpperCase()}_NOT_FOUND`;
                            throw new BadRequest({ fields: fields });
                        }
                        throw new InternalError(err);
                    }
                    data[fieldName] = true;
                }
            };

            await uploadAttachmentJob(cover_image, 'cover_image');
            await uploadAttachmentJob(sample_post, 'sample_post');

            const result = await this._jobModel.updateOne({ _id: jobId }, <IJob>data);

            if (result['ok']) {
                return true;
            }
            return false;
        });
    }

    async updateAttachment(jobId: string, files: any, error: number) {
        let job = await this.getJobById(jobId);
        if (job.status != JobStatus.Raw) throw new Forbidden('JOB_RUNNING');
        const result: Array<any> = [];
        if (files.cover_image) {
            result.push(await this.uploadAttachmentForJob(job, files.cover_image, 'cover_image'));
        }

        if (files.sample_post) {
            result.push(await this.uploadAttachmentForJob(job, files.sample_post, 'sample_post'));
        }

        if (error) {
            if (result.filter(f => f.success == false).length > 0) {
                // remove job
                await job.remove();
            }
        }

        return result;
    }

    async uploadAttachmentForJob(job: Job, attachment: any, fieldName: string) {
        if (await this._storage.checkUploadFileType(attachment.path, ImageMIME)) {
            try {
                const result = await this._storage.storeUploadFile(attachment.path, 'job/' + job._id, fieldName);
                job[fieldName] = fieldName;
                await job.save();
                return {
                    name: fieldName,
                    success: true
                };
            } catch (err) {
                console.log(err);
                return {
                    name: fieldName,
                    success: false
                };
            }
        }
        const fields = {};
        fields[fieldName] = 'ATTACHMENT_WRONG_TYPE';

        throw new BadRequest({ fields: fields });
    }

    async updateGroup(jobId: string, tag: number, data: GroupItem) {
        const job = await this.getJobById(jobId);
        const group = <GroupItem>this.checkGroup(job, tag, true);

        if (data.tag != tag) {
            this.checkGroup(job, data.tag, false);
        }

        if (data.price) group.price = data.price;
        if (data.tag) group.tag = data.tag;
        return job.save();
    }

    public async updateEngagement(jobId: string) {
        const job = await this._jobModel.findById(jobId).populate('kol_jobs');
        if (!job) throw new NotFound('JOB_NOT_FOUND');
        const result: any = { kol_jobs: [], engagement: {} };
        const jobEngagement: any = {
            total_reaction: 0,
            total_share: 0,
            total_comment: 0,
            total_like: 0
        };

        for (const kolJob of <KolJob[]>job.kol_jobs) {
            if (kolJob.post.id) {
                const engagement = await getInfoPost(kolJob.post.id);
                kolJob.engagement = engagement;
                await kolJob.save();
                result.kol_jobs.push({ job_id: kolJob._id, engagement: engagement });

                jobEngagement.total_reaction += engagement.reaction;
                jobEngagement.total_comment += engagement.comment;
                jobEngagement.total_share += engagement.share;
                jobEngagement.total_like += engagement.like;
            }
        }

        job.statistic.engagement.total_comment = jobEngagement.total_comment;
        job.statistic.engagement.total_like = jobEngagement.total_like;
        job.statistic.engagement.total_share = jobEngagement.total_share;
        job.statistic.engagement.total_reaction = jobEngagement.total_reaction;

        result.engagement = jobEngagement;
        await job.save();

        return result;
    }

    public async closeJob(jobId: string, reason?: string) {
        const job = await this._jobModel.findById(jobId).populate('kol_jobs');
        if (!job) throw new NotFound('JOB_NOT_FOUND');

        const kolJobs = <KolJob[]>job.kol_jobs;
        let checkAllClose = true;
        if (kolJobs) {
            for (const kolJob of kolJobs) {
                if (kolJob.status == KolJobStatus.Active) {
                    checkAllClose = false;
                    break;
                }
            }
        }

        if (!checkAllClose) throw new Forbidden('EXISTS_KOL_JOB_NOT_CLOSE');
        job.status = JobStatus.Close;
        if (reason) job.reason_complete = reason;
        return job.save();
    }

    public async autoFinishJob() {
        return this.finishJobCommand.excute();
    }
    /**/

    /* REMOVE */
    public async removeJob(jobId: string) {
        const rs = await this._jobModel.deleteOne({ _id: jobId });
        return rs['deletedCount'] > 0;
    }

    public async removeGroup(jobId: string, tag: number) {
        const job: Job = await this.getJobById(jobId);
        const group = job.groups.find(g => g.tag == tag);
        if (group && group.kols && group.kols.length > 0) {
            throw new Forbidden('KOL_GROUP_NOT_EMPTY');
        }
        job.groups = job.groups.filter(g => g.tag != tag);
        return this.triggerLocation(job);
    }

    public async removeKols(jobId: string, groups: Array<{ tag: number; kols: [string] }>) {
        const job: Job = await this.getJobById(jobId);
        const invites = await this._jobInviteModel.find({
            _id: { $in: job.invites }
        });

        const inviteIds = invites.reduce((arr: Array<string>, invite: JobInvite) => {
            arr.push(invite.kol_id.toString());
            return arr;
        }, []);
        groups.forEach(g => {
            const _g = job.groups.find(_g => _g.tag == g.tag);
            if (_g) {
                _g.kols = _g.kols.filter(_kId => {
                    return !g.kols.find(kId => kId == _kId) || inviteIds.find(id => _kId == id);
                });
            }
        });
        return this.triggerLocation(job);
    }
    /* */

    /* PRIVATE */
    private fixParams(obj: object, option: IOptionFix) {
        var keys: Array<string> = Object.keys(obj);
        if (option.includes) {
            keys = keys.filter(key => (<Array<string>>option.includes).indexOf(key) == -1);
        }

        if (option.excludes) {
            keys = keys.filter(key => (<Array<string>>option.excludes).indexOf(key) == -1);
        }
        return keys.reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
    }

    private checkKolsGroup(job: Job, group: IGroupItem, isExists: boolean) {
        const kolIds: Array<string> = this.getAllKolIds(job);
        if (!group.kols || group.kols.length == 0) return;
        var checkExists: boolean = false;
        group.kols.forEach(kolId => {
            if (kolIds.find(f => f == kolId)) {
                checkExists = true;
            }
        });

        if (isExists && !checkExists) {
            throw new NotFound('KOL_NOT_FOUND');
        } else if (!isExists && checkExists) {
            throw new NotFound('KOL_EXIST');
        }
    }

    private getAllKolIds(job: Job) {
        const excuteFunc = (arr: Array<string>, g: GroupItem) => {
            for (const kol of g.kols) {
                arr.push(kol);
            }
            return arr;
        };
        return job.groups.reduce(excuteFunc, []);
    }

    private async checkBeforeAddGroup(jobId: string, data: GroupItem) {
        const job = await this.getJobById(jobId);
        this.checkGroup(job, data.tag, false);
        this.checkKolsGroup(job, data, false);
        return job;
    }

    private getGroupByTag(job: Job, tag: number) {
        const group = job.groups.find(g => g.tag == tag);
        return group;
    }

    private async getJobById(jobId: string) {
        const job: Job = <Job>await this.findById(jobId);
        if (!job) throw new NotFound('JOB_NOT_FOUND');
        return job;
    }

    private checkGroup(job: Job, tag: number, isExists: boolean) {
        const group = this.getGroupByTag(job, tag);
        if (isExists && !group) {
            throw new NotFound('GROUP_NOT_FOUND');
        } else if (!isExists && group) {
            throw new NotFound('GROUP_EXIST');
        }
        return group;
    }

    private checkExistKol(kolId: string, job: Job) {
        const kolIdsExists = this.getAllKolIds(job);
        if (kolIdsExists.find(_kid => _kid == kolId)) {
            return true;
        }
        return false;
    }
    /**/

    /**
     * Aggregate ongoing job (simple)
     *
     * @param kol_jobs Kol job array
     * @param kol_jobs Kol job array
     *
     * @return {Object} Stats
     */
    aggregateOngoingJobSimple(kol_jobs: any): IOngoingJobSimple {
        let result: IOngoingJobSimple = {
            kol_count: 0,
            post_count: 0,
            accept_count: 0
        };

        // calculating
        result.kol_count = kol_jobs.length;

        kol_jobs.forEach(kol_job => {
            result.post_count += kol_job.post.status === 3 ? 1 : 0;
            result.accept_count += kol_job.status === 2 ? 1 : 0;
        });

        return result;
    }

    /**
     * Calculate stats of kol jobs
     *
     * @param kol_jobs List kol jobs
     *
     * @return {IJobStats} Stats
     */
    aggregateJob(kol_jobs: any): IJobStats {
        let result: IJobStats = {
            post: 0,
            buzz: 0,
            engagement: 0,
            reaction: 0,
            comment: 0,
            share: 0,
            approved_content_post: 0,
            approved_link_post: 0,
            completed_post: 0,
            kol_count: 0,
            timeline: {}
        };

        result.kol_count = kol_jobs.length;

        kol_jobs.map(kol_job => {
            result.post += kol_job.post.status === 3 ? 1 : 0;
            result.approved_content_post += kol_job.post.status === 3 || kol_job.post.status === 2 ? 1 : 0;
            result.approved_link_post += kol_job.post.status === 3 ? 1 : 0;
            result.completed_post += kol_job.status === 3 ? 1 : 0;

            let total_engagement =
                (kol_job.engagement.share || 0) +
                (kol_job.engagement.comment || 0) +
                (kol_job.engagement.reaction || 0);

            result.buzz += (kol_job.engagement.share || 0) + (kol_job.engagement.comment || 0);
            result.engagement += total_engagement;
            result.reaction += kol_job.engagement.reaction || 0;
            result.comment += kol_job.engagement.comment || 0;
            result.share += kol_job.engagement.share || 0;

            if (kol_job.time) {
                if (result.timeline[kol_job.time] === undefined)
                    result.timeline[kol_job.time] = {
                        register: 0,
                        done: 0
                    };
                result.timeline[kol_job.time].register += 1;

                result.timeline[kol_job.time].done += kol_job.post.status === 3 ? 1 : 0;
            }

            kol_job.set('total_engagement', total_engagement, { strict: false });
        });

        return result;
    }

    public async triggerLocation(job: Job) {
        const kolIds = this.getAllKolIds(job);
        job.kol_histories = job.kol_histories.filter(k => kolIds.find(kId => kId == k.kol_id.toString()));
        if (job && kolIds) {
            // location
            const kols = await this._kolUserModel.find({ _id: { $in: kolIds } });
            const arrLocation: Array<{ id: string; count: number }> = [];
            let total_follower: number = 0;
            let total_reaction: number = 0;
            let total_comment: number = 0;
            let total_share: number = 0;
            let total_engagement: number = 0;

            let jobs: Array<any> = [];
            let share_stories: Array<any> = [];

            for (const kol of kols) {
                let location: string = '';
                if (kol.location) {
                    location = kol.location;
                } else if (_.has(kol, 'kol_info.evaluate.province')) {
                    location = _.get(kol, 'kol_info.evaluate.province');
                }

                if (!location) {
                    location = 'other';
                }
                const dataLocation = arrLocation.find(o => o['id'] == location);
                if (dataLocation) {
                    dataLocation['count'] += 1;
                } else {
                    arrLocation.push({ id: location, count: 1 });
                }

                // follower
                total_follower += _.get(kol, 'facebook.analytic.total_follower', 0);
                total_reaction += _.get(kol, 'facebook.analytic.avg_reaction_last_3_month', 0);
                total_comment += _.get(kol, 'facebook.analytic.avg_comment_last_3_month', 0);
                total_share += _.get(kol, 'facebook.analytic.avg_sharing_last_3_month', 0);
                total_engagement += _.get(kol, 'facebook.analytic.avg_engagement_last_3_month', 0);

                // job
                if (kol.kol_info['job']) {
                    for (const jobId of kol.kol_info['job']) {
                        const job = jobs.find(j => j['id'].toString() == jobId.toString());
                        if (job) {
                            job['count'] += 1;
                        } else {
                            const catJob = await this.categoryJobModel.findOne({ 'jobs._id': jobId });
                            if (catJob) {
                                const job = catJob.jobs.find(j => j._id.toString() == jobId.toString());
                                if (job) {
                                    jobs.push({
                                        id: jobId,
                                        name: job.name,
                                        count: 1
                                    });
                                }
                            }
                        }
                    }
                }

                // job
                if (kol.kol_info['share_story']) {
                    for (const shareId of kol.kol_info['share_story']) {
                        const shareStory = share_stories.find(j => j['id'].toString() == shareId.toString());
                        if (shareStory) {
                            shareStory['count'] += 1;
                        } else {
                            const catShareStory = await this.categoryShareStoryModel.findOne({
                                'share_stories._id': shareId
                            });
                            if (catShareStory) {
                                const shareStory = catShareStory.share_stories.find(
                                    j => j._id.toString() == shareId.toString()
                                );
                                if (shareStory) {
                                    share_stories.push({
                                        id: shareId,
                                        name: shareStory.name,
                                        count: 1
                                    });
                                }
                            }
                        }
                    }
                }
            }

            job.statistic.location = arrLocation;
            job.statistic.kol.follower = total_follower;
            job.statistic.kol.comment = total_comment;
            job.statistic.kol.share = total_share;
            job.statistic.kol.reaction = total_reaction;
            job.statistic.kol.engagement = total_engagement;

            job.statistic.job = jobs.sort((a, b) => b['count'] - a['count']);
            job.statistic.share_story = share_stories.sort((a, b) => b['count'] - a['count']);
            // total follower
        }
        return job.save();
    }

    public async updateAutoPostLink(condition: object) {
        return this.commandPostLink.excute(condition);
    }

    public async generateJobs(condition: object) {
        return await this.commandJobSeed.excute(condition);
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
}
