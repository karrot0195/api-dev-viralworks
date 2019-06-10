import { MailStateContext } from '../MailStateContext';

export interface IMailState {
    sendMail(context: MailStateContext, receiverEmail: string, receiverName: string, data?: object): object;
}

export interface IEmailData {
    address: string;
    name: string;
    payload: object;
}
