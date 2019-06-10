import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';
import { InternalError } from 'System/Error/InternalError';

export class MailKolVerifyEmailState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data?: object) {
        if (!data || !data['token']) {
            throw new InternalError('TOKEN IS REQUIRED - mail kol verify email');
        }
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(),
            html: this.getContent(receiverName, this.getLinkCallback(data['token']))
        };
        return context.sgMail.send(msg);
    }

    getContent(receiverName: string, link: string) {
        const templatePath = process.cwd() + '/Resources/Views/Mail/Kol/verify-email.pug';
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            title: this.getSubject(),
            kol_name: receiverName,
            link: link
        });
    }

    getSubject() {
        return '[ViralWorks] Yêu cầu xác nhận tài khoản';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }

    getLinkCallback(token: string) {
        return `${this.getFrontEndUrl()}/kol/verify-account/${token}/recovery`;
    }

    getFrontEndUrl() {
        return process.env.FRONT_END_URL || 'https://viralworks.com';
    }
}
