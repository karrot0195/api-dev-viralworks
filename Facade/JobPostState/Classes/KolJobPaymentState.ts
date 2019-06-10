import { IKolJobState } from '../Interfaces/IKolJobState';
import { KolJobAction, KolJobStatus } from 'App/Models/KolJobModel';
import { KolJobStateContext } from '../KolJobStateContext';
import { MailType } from 'App/Models/MailModel';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { KolJob } from 'Database/Schema/KolJobSchema';
import { ClientSession } from 'mongodb';

export class KolJobPaymentState implements IKolJobState {
    async accept(context: KolJobStateContext, session: ClientSession) {
        const mailResponse = await context.sendMail('accept', session);
        console.log(mailResponse);
        if (mailResponse) {
            const subject = context.getSubject();
            await this.acceptJob(context, subject, mailResponse, session);
            await this.updateKolAcceptPrice(subject, session);
            return true;
        }
        return false;
    }

    async reject(context: KolJobStateContext, reason: string, session: ClientSession) {
        // send mail
        const mailResponse = await context.sendMail('reject', session);
        if (mailResponse) {
            const subject = context.getSubject();
            await this.rejectJob(context, subject, mailResponse, reason, session);
            await this.updateKolRejectPrice(subject, session);
            return true;
        }
        return false;
    }

    public getMailType() {
        return MailType.KOl_JOB_PAYMENT;
    }

    /* PRIVATE */
    private async acceptJob(context: KolJobStateContext, subject: KolJob, mailResponse: any, session?: ClientSession) {
        subject.status = KolJobStatus.Payment;

        const data = {
            causer_id: context.getCauserId(),
            job_post_status: subject.post.status,
            job_status: subject.status,
            type: KolJobAction.Accept,
            ref_id: mailResponse.message_id,
            time: new Date()
        };
        subject.histories.push(data);
        await subject.save({ session });
    }

    private async rejectJob(context: KolJobStateContext, subject: KolJob, mailResponse: any, reason: string, session?: ClientSession) {
        subject.status = KolJobStatus.RejectPayment;

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
        await subject.save({ session });
    }

    private async updateKolAcceptPrice(kolJob: KolJob, session?: ClientSession) {
        const kol = <KolUser>kolJob.kol_id;
        const price = kolJob.price;

        kol.income['pending'] = kol.income['pending'] - price;
        kol.income['approved'] = kol.income['approved'] + price;
        await kol.save({ session });
    }

    private async updateKolRejectPrice(kolJob: KolJob, session?: ClientSession) {
        const kol = <KolUser>kolJob.kol_id;
        const price = kolJob.price;
        kol.income['pending'] = kol.income['pending'] - price;
        await kol.save({ session });
    }
    /**/
}
