import { ICommand } from 'System/Interface/Command';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { JobModel } from 'App/Models/JobModel';
import { KolUserModel } from 'App/Models/KolUserModel';
import { JobInviteService } from 'App/Modules/Job/Services/JobInviteService';
import { UserModel } from 'App/Models/UserModel';
import { KolJobModel, KolJobPostStatus, KolJobStatus } from 'App/Models/KolJobModel';
import * as _ from 'lodash';
import { get15Post } from 'Facade/SocialiteProvider/Helper/FacebookHelper';
import { sleep } from 'System/Helpers/Misc';

@Injectable
export class PostLinkCommand implements ICommand {
    constructor(
        private _mongo: Mongo,
        private userModel: UserModel,
        private inviteService: JobInviteService,
        private _jobModel: JobModel,
        private _kolModel: KolUserModel,
        private _kolJobModel: KolJobModel
    ) {}
    run = async () => {
        return await this.excute();
    };

    public async excute(condition?: object) {
        const query = this._kolJobModel.find();
        if (condition && condition['job_id']) {
            query.where({ job_id: condition['job_id'] });
        } else {
            query.where({
                status: KolJobStatus.Active,
                'post.status': {
                    $gte: KolJobPostStatus.Content
                },
                $or: [{ 'post.id': { $exists: false } }]
            });
        }
        const kolJobs = await query
            .populate('kol_id', ['facebook.entity_id'])
            .populate('job_id', ['sharelink', 'hashtags', 'type'])
            .select(['post', 'created_at']);

        const kJobLink: Array<any> = [];
        for (const kJob of kolJobs) {
            const entityId = _.get(kJob.kol_id, 'facebook.entity_id');
            const hashtags = _.get(kJob.job_id, 'hashtags');
            const link = _.get(kJob.job_id, 'sharelink');
            const created_at = _.get(kJob, 'created_at');
            console.log('\x1b[32m', `process kol job ${kJob._id}`, '\x1b[0m');
            if (entityId) {
                const response = await get15Post(entityId, ['message', 'type', 'id', 'link']);
                const post = this.takeInfoPost(created_at, hashtags, response['data']);
                if (post) {
                    kJob.post.id = post['id'];
                    kJob.post.link = `https://www.facebook.com/${post['id']}`;
                    kJob.post.status = KolJobPostStatus.Link;
                    kJob.post.request = 0;

                    kJobLink.push({
                        id: kJob._id,
                        post_id: kJob.post.id,
                        post_link: kJob.post.link
                    });
                    await kJob.save();
                }
            }
            await sleep(2000);
        }
        return {
            count: kJobLink.length,
            data: kJobLink
        };
    }

    // check time & hashtag
    private takeInfoPost(created_at, hashtags: Array<string>, data: Array<object>) {
        if (data.length > 0 && hashtags.length > 0) {
            for (const post of data) {
                // 1h
                const time = +new Date(post['created_time']) - +new Date(created_at) + 3600000;
                console.log(time);
                if (time < 0) {
                    break;
                }

                if (post['message']) {
                    let check = true;
                    for (const hashtag of hashtags) {
                        const tag = hashtag.replace('#', '');
                        const match = post['message'].match(new RegExp(`#${tag}`));

                        if (!match) {
                            check = false;
                        }
                    }

                    if (check) {
                        return post;
                    }
                }
            }
        }
        return null;
    }
}
