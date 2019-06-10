import { IMailState } from '../Interfaces/IMailState';
import { MailStateContext } from '../MailStateContext';

export class MailRejectRequestPaymentState implements IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data: {price: number}) {
        const msg = {
            to: receiverEmail,
            from: this.getMailFrom(),
            subject: this.getSubject(),
            html: this.getContent(receiverName, data.price)
        };
        return context.sgMail.send(msg);
    }

    getContent(kolName: string, price: number) {
        const templatePath = process.cwd() + `/Resources/Views/Mail/Kol/reject_payment_request.pug`;
        const pug = require('pug');
        // render html
        const compiledFunction = pug.compileFile(templatePath);
        // send mail
        return compiledFunction({
            price: price,
            kol_name: kolName
        });
    }

    getSubject() {
        return `[ViralWorks] Từ chối yêu cầu thanh toán`;
    }

    getMailFrom() {
        return process.env.MAIL_FROM || 'info@viralworks.com';
    }

}