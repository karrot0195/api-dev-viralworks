import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';

export class MailFacebookLinkState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data?: object) {
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(),
            html: this.getContent(receiverName)
        };
        return context.sgMail.send(msg);
    }

    getContent(receiverName: string) {
        const templatePath = process.cwd() + '/Resources/Views/Mail/Kol/update_facebook_link.pug';
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            title: this.getSubject(),
            kol_name: receiverName
        });
    }

    getSubject() {
        return '[ViralWorks] Yêu cầu cập nhật link facebook';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }
}
