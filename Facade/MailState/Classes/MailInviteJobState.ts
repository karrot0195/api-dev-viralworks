import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';
import { InternalError } from 'System/Error';

export class MailInviteJobState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data?: object) {
        if (!data || !data['invite_id']) throw new InternalError('INVITE_ID_REQUIRED');

        const invite_id = data['invite_id'];
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(),
            html: this.getContent(receiverName, this.getLinkInviteJob(invite_id))
        };
        return context.sgMail.send(msg);
    }

    getContent(receiverName: string, linkJob: string) {
        const templatePath = process.cwd() + '/Resources/Views/Mail/Kol/job_invite.pug';
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            title: this.getSubject(),
            kol_name: receiverName,
            link: linkJob
        });
    }

    getSubject() {
        return '[ViralWorks] Cong Viec Moi';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }

    getLinkInviteJob(invite_id: string) {
        return `${this.getFrontEndUrl()}/kol/dashboard/invite/${invite_id}`;
    }

    getFrontEndUrl() {
        return process.env.FRONT_END_URL || 'https://viralworks.com';
    }
}
