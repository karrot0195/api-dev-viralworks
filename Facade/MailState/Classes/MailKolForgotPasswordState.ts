import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';
import { InternalError } from 'System/Error/InternalError';

export class MailKolForgotPasswordState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data?: object) {
        if (!data || !data['token']) {
            throw new InternalError('TOKEN IS REQUIRED - mail kol forgot password');
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
        const templatePath = process.cwd() + '/Resources/Views/Mail/Kol/forgot-password.pug';
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
        return '[ViralWorks] Yêu cầu thay đổi mật khẩu';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }

    getLinkCallback(token: string) {
        return `${this.getFrontEndUrl()}/kol/forgot-password/${token}/recovery`;
    }

    getFrontEndUrl() {
        return process.env.FRONT_END_URL || 'https://viralworks.com';
    }
}
