import { Injectable } from 'System/Injectable';
import { NotFound, InternalError, SystemError } from 'System/Error';
import { KolUserModel } from 'App/Models/KolUserModel';
import { MailModel, IMail, MailStatus } from 'App/Models/MailModel';
import * as _ from 'lodash';

@Injectable
export class MailService {
    private sgMail: any;
    constructor(private readonly _kolModel: KolUserModel, private readonly _mailModel: MailModel) {
        this.sgMail = require('@sendgrid/mail');
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }

    private sendMail(to: string, subject: string, html: string) {
        try {
            const msg = {
                to: to,
                from: process.env.MAIL_FROM || 'Viralworks',
                subject: subject,
                html: html
            };
            return this.sgMail.send(msg);
        } catch(err) {
            throw new SystemError(err);
        }
    }

    async sendMailTemplateKol(kolId: string, typeMail: string) {
        const kolUser = await this._kolModel.findById(kolId);
        const fs = require('fs');

        if (!kolUser) {
            throw new NotFound('Not found kol user');
        }
        const email = kolUser['email'];
        if (!email) {
            throw new InternalError('Not exists email field');
        }
        var fileHtml: string = '';
        var templatePath: string = '';
        var subject: string = '';

        switch (parseInt(typeMail)) {
            case 0:
                subject = 'Thông báo về việc đăng ký tài khoản';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/verified.html';
                break;
            case 1:
                subject = 'Thông báo về việc đăng ký tài khoản';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/rejected.html';
                break;
            case 2:
                subject = 'Thông báo về việc đăng ký tài khoản';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/update_facebook_link.html';
                break;
            default:
                throw new NotFound('Not found path template');
        }
        fileHtml = await fs.readFileSync(templatePath, 'utf-8');
        const dataMails =  await this.sendMail(email, subject, fileHtml);
        return this.createDataMails(dataMails, email);
      
    }

    private async createDataMails(dataMails: Array<object>, email: string) {
        var result: Array<object> = [];
        for(let dataMail of dataMails) {
            // send success
            if (dataMail && dataMail['statusCode'] >= 200 && dataMail['statusCode'] < 300) {
                const data = {
                    message_id: _.get(dataMail, 'headers.x-message-id'),
                    email: email,
                    status: MailStatus.Success
                }
                result.push(await this._mailModel.create(<IMail>data));
            }
        }
        return result;
    }
}
