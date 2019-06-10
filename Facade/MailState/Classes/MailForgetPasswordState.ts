import { IMailState, IEmailData } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';

export class MailForgetPasswordState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, payload: any) {
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(),
            html: this.getContent(payload.brand_name, payload.email, payload.token)
        };
        return context.sgMail.send(msg);
    }

    getContent(brand_name: string, email: string, token: string) {
        const templatePath = process.cwd() + '/Resources/Views/Mail/Brand/forgot_password.pug';
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            title: this.getSubject(),
            brand_name: brand_name,
            email: email,
            token: token
        });
    }

    getSubject() {
        return '[ViralWorks] Khôi phục mật khẩu tài khoản';
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }
}
