import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';

export class MailJobCloseState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data: {job_title: string, job_link: string}) {
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(data.job_title),
            html: this.getContent(receiverName, data.job_link)
        };
        return context.sgMail.send(msg);
    }

    getContent(kolName: string, jobLink: string) {
        const templatePath = process.cwd() + `/Resources/Views/Mail/Kol/job_close.pug`;
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            job_link: jobLink,
            kol_name: kolName
        });
    }

    getSubject(jobTitle: string) {
        return `[ViralWorks] Thông báo cập nhật link bài đăng: [${jobTitle}]`;
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }

}