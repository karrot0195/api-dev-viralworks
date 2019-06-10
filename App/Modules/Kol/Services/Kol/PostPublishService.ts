import { KolJob } from 'Database/Schema/KolJobSchema';
import { Job } from 'Database/Schema/JobSchema';
import { KolJobAction, KolJobModel, KolJobPostStatus } from 'App/Models/KolJobModel';
import { Forbidden } from 'System/Error/Forbidden';
import { JobModel, JobType } from 'App/Models/JobModel';
import { ValidationError } from 'System/Error/ValidationError';
import { Mongo } from 'System/Mongo';
import { Injectable } from 'System/Injectable';
import { NotFound } from 'System/Error/NotFound';
import { AttachmentService } from 'App/Modules/Attachment/Services/AttachmentService';
import { SocketProvider, SocketType } from 'Facade/SocketProvider/SocketProvider';
import { takePostIdByLinkPost } from 'Facade/SocialiteProvider/Helper/FacebookHelper';
import { KolUser } from 'Database/Schema/KolUserSchema';
import * as _ from 'lodash';
import { KolUserModel } from 'App/Models/KolUserModel';

@Injectable
export class PostPublishService {
    constructor(
        private mongo: Mongo,
        private _kolJobModel: KolJobModel,
        private _kolUserModel: KolUserModel,
        private _jobModel: JobModel,
        private _attachmentService: AttachmentService,
        private _socketService: SocketProvider
    ) {}

    public async publishContent(kJobId: string, data: object) {
        const kolJob = <KolJob>await this.findKolJobById(kJobId);
        const job = <Job>kolJob.job_id;

        if (kolJob.post.request == 1) throw new Forbidden('REQUEST_PENDING');

        if (!(kolJob.post.status == KolJobPostStatus.Raw)) throw new Forbidden('STATUS_NOT_ALLOW');

        if (job.type == JobType.Photo) {
            if (!data['attachments']) {
                throw new ValidationError({
                    image: 'IMAGE_REQUIRED'
                });
            }
        }

        if (data['attachments']) {
            const count = await this._uploadPostAttachments(data['attachments'], kJobId);
            kolJob.post.attachments = count;
        } else {
            kolJob.post.attachments = 0;
        }

        kolJob.post.content = data['content'];
        await this.pushNotifyAddminPublishContent(kolJob);
        kolJob.post.request = 1;
        this.addRequestHistory(kolJob);
        return kolJob.save();
    }

    private async pushNotifyAddminPublishContent(kolJob: KolJob) {
        const job = await this._jobModel.findById(<string>kolJob.job_id);
        if (job) {
            const message: string = `[Job-${job.title}] Updated post content`;
            this._socketService.pushAdminNotify(message, SocketType.FlashMessage);
        }
    }

    public async publishLink(kJobId: string, link: string) {
        const kolJob = <KolJob>await this.findKolJobById(kJobId);
        if (kolJob.post.request == 1) throw new Forbidden('REQUEST_PENDING');
        if (!(kolJob.post.status == KolJobPostStatus.Content)) throw new Forbidden('STATUS_NOT_ALLOW');
        kolJob.post.link = link;
        kolJob.post.request = 1;
        if (takePostIdByLinkPost(link)) {
            const kol = await this._kolUserModel.findById(<string>kolJob.kol_id);
            if (kol) {
                const entity_id = _.get(kol, 'facebook.entity_id');
                const post_id = takePostIdByLinkPost(link);
                kolJob.post.id = `${entity_id}_${post_id}`;
            }
        }
        this.addRequestHistory(kolJob);
        return kolJob.save();
    }

    public async renderAttachment(kJobId: string, fileName: string) {
        const kolJob = <KolJob>await this.findKolJobById(kJobId);
        if (!kolJob.post.attachments) throw new NotFound('ATTACHMENT_NOT_FOUND');
        const path = `kol_job/${kJobId}`;
        return this._attachmentService.renderAttachment(path, fileName);
    }

    private async _uploadPostAttachments(fileNames: Array<string>, kolJobId: string) {
        const path = `kol_job/${kolJobId}`;
        var count = 0;
        for (let i = 0; i < fileNames.length; i++) {
            await this._attachmentService.uploadAttachmentFromTemp(fileNames[i], path, `attachment-${i}`);
            count++;
        }

        return count;
    }

    private async findKolJobById(id: string): Promise<KolJob> {
        const kolJob = await this._kolJobModel.findById(id);
        if (!kolJob) throw new NotFound('KOL_JOB_NOT_FOUND');
        return kolJob;
    }

    private addRequestHistory(kolJob: KolJob) {
        kolJob.histories.push({
            job_status: kolJob.status,
            job_post_status: kolJob.post.status,
            time: new Date(),
            type: KolJobAction.Request
        });
    }
}
