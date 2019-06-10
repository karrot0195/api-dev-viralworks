import { IKolJobState } from '../Interfaces/IKolJobState';
import { KolJobPostStatus, KolJobAction } from 'App/Models/KolJobModel';
import { KolJobStateContext } from '../KolJobStateContext';
import { MailType } from 'App/Models/MailModel';
import { ClientSession } from 'mongoose';

export class KolJobLinkState implements IKolJobState {
    async accept(context: KolJobStateContext, session: ClientSession) {
        const mailResponse =  await context.sendMail('accept', session);
        if (mailResponse) {
            const subject = context.getSubject();
            subject.post.status = KolJobPostStatus.Link;
            const data = {
                causer_id: context.getCauserId(),
                job_post_status: KolJobPostStatus.Link,
                job_status: subject.status,
                type: KolJobAction.Accept,
                ref_id: mailResponse.message_id,
                time: new Date()
            };

            subject.histories.push(data);
            subject.post.request = 0;
            await subject.save({ session });
            return true;
        }
        return false;
    }

    async reject(context: KolJobStateContext, reason: string, session: ClientSession) {
        // send mail
        const mailResponse = await context.sendMail('reject', session);
        if (mailResponse) {
            const subject = context.getSubject();
            const data = {
                causer_id: context.getCauserId(),
                job_post_status: subject.post.status,
                job_status: subject.status,
                reason: reason,
                type: KolJobAction.Reject,
                ref_id: mailResponse.message_id,
                time: new Date()
            };
            subject.histories.push(data);
            subject.post.request = -1;
            await subject.save({ session });
            return true;
        }
        return false;
    }

    public getMailType() {
        return MailType.POST_JOB_LINK;
    }
}
