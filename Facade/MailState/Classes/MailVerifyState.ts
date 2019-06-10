import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';

export class MailVerifyState implements IMailState {
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
        const templatePath = process.cwd() + '/Resources/Views/Mail/Kol/verified.pug';
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
        return '[ViralWorks] Thông báo về việc đăng ký tài khoản';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }
}
