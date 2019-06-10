import { IMailState } from './Interfaces/IMailState';
import { MailType } from 'App/Models/MailModel';
import { MailVerifyState } from './Classes/MailVerifyState';
import { MailRejectState } from './Classes/MailRejectState';
import { Injectable } from 'System/Injectable';
import { MailFacebookLinkState } from './Classes/MailFacebookLinkState';
import { MailInviteJobState } from './Classes/MailInviteJobState';
import { MailPostContentState } from './Classes/MailPostContentState';
import { MailPostLinkState } from './Classes/MailPostLinkState';
import { MailJobCloseState } from './Classes/MailJobCloseState';
import { MailJobPayment } from './Classes/MailJobPayment';
import { Forbidden } from 'System/Error';
import { MailForgetPasswordState } from './Classes/MailForgetPasswordState';
import { MailAcceptRequestPaymentState } from 'Facade/MailState/Classes/MailAcceptRequestPaymentState';
import { MailRejectRequestPaymentState } from 'Facade/MailState/Classes/MailRejectRequestPaymentState';
import { MailKolForgotPasswordState } from 'Facade/MailState/Classes/MailKolForgotPasswordState';
import { MailKolVerifyEmailState } from 'Facade/MailState/Classes/MailKolVerifyEmailState';

const enum Error {
    STATE_NOT_EXISTS = 'State not exists'
}

class MailStateFactory {
    static createMailState(mailType: number): IMailState {
        switch (mailType) {
            case MailType.VERIFY_KOL:
                return new MailVerifyState();
            case MailType.REJECT_KOL:
                return new MailRejectState();
            case MailType.REQUIRE_UPDATE_FACEBOO_LINK:
                return new MailFacebookLinkState();
            case MailType.INVITE_JOB:
                return new MailInviteJobState();
            case MailType.POST_JOB_CONTENT:
                return new MailPostContentState();
            case MailType.POST_JOB_LINK:
                return new MailPostLinkState();
            case MailType.KOL_JOB_CLOSE:
                return new MailJobCloseState();
            case MailType.KOl_JOB_PAYMENT:
                return new MailJobPayment();
            case MailType.BRAND_FORGOT_PASSWORD:
                return new MailForgetPasswordState();
            case MailType.ACCEPT_REQUEST_PAYMENT:
                return new MailAcceptRequestPaymentState();
            case MailType.REJECT_REQUEST_PAYMENT:
                return new MailRejectRequestPaymentState();
            case MailType.KOL_FORGOT_PASSWORD:
                return new MailKolForgotPasswordState();
            case MailType.KOL_VERIFY_EMAIL:
                return new MailKolVerifyEmailState();
            default:
                throw new Forbidden('STATE_NOT_FOUND');
        }
    }
}

@Injectable
export class MailStateContext {
    private state: IMailState;
    public sgMail;

    constructor() {
        this.sgMail = require('@sendgrid/mail');
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
        this.state = new MailVerifyState();
    }

    setState(state: IMailState) {
        this.state = state;
    }

    private setStateByMailType(mailType: number) {
        this.state = MailStateFactory.createMailState(mailType);
    }

    sendMail(mailType: number, receiverEmail: string, receiveName: string, data?: object) {
        this.setStateByMailType(mailType);

        if (process.env.ENV == 'dev') {
            console.log('not send mail env dev');
            return [{ statusCode: 200, 'headers.x-message-id': +new Date() }];
        } else {
            return this.state.sendMail(this, receiverEmail, receiveName, data);
        }
    }
}
