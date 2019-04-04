import { Injectable } from 'System/Injectable';
import { NotFound, InternalError, SystemError } from 'System/Error';
import { KolUserModel, HistoryActionType } from 'App/Models/KolUserModel';
import { MailModel, IMail, MailStatus, IEventMail } from 'App/Models/MailModel';
import * as _ from 'lodash';
import { Mongo } from 'System/Mongo';

@Injectable
export class MailService {
    private sgMail: any;
    constructor(private readonly _kolModel: KolUserModel, private readonly _mailModel: MailModel, private readonly _mongo: Mongo) {
        this.sgMail = require('@sendgrid/mail');
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }

    private sendMail(to: string, subject: string, html: string) {
        try {
            const msg = {
                to: to,
                from: process.env.MAIL_FROM || 'Viralworks',
                subject: subject,
                html: html,
                text: 'Viralworks'
            };
            return this.sgMail.send(msg);
        } catch (err) {
            throw new SystemError(err);
        }
    }

    async sendMailTemplateKol(causerId: string, kolId: string, mailType: string) {
        return this._mongo.transaction(async session => {
            const kolUser = await this._kolModel.findById(kolId);
            const pug = require('pug');

            if (!kolUser) {
                throw new NotFound('Not found kol user');
            }
            const email = kolUser['email'];
            if (!email) {
                throw new InternalError('Not exists email field');
            }
            const { mailStatus, subject, templatePath } = this.getInfoTemplateMaileByType(parseInt(mailType));

            // render html
            const compiledFunction = pug.compileFile(templatePath);

            // send mail
            const responseMail = await this.sendMail(email, subject, compiledFunction({
                title: subject,
                kol_name: _.get(kolUser, 'facebook.name', 'kol')
            }));

            // add history
            const messageId = _.get(responseMail[0], 'headers.x-message-id', null);
            const statusCode = _.get(responseMail[0], 'statusCode', 400);
            _.get(kolUser, 'kol_info.history_action', []).push({
                causer_id: causerId,
                type: HistoryActionType.Mail,
                kol_status: mailStatus,
                ref_id: messageId
            });

            await kolUser.save();
            // create data mail
            return this.createDataMail(email, messageId, statusCode);
        });
    }

    private getInfoTemplateMaileByType(mailType: number) {
        var templatePath: string = '';
        var subject: string = '';
        var mailStatus: number;

        switch (mailType) {
            case 1:
                subject = '[ViralWorks] Thông báo về việc đăng ký tài khoản';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/verified.pug';
                mailStatus = 1;
                break;
            case 2:
                subject = '[ViralWorks] Thông báo về việc đăng ký tài khoản';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/rejected.pug';
                mailStatus = 2;
                break;
            case 3:
                subject = '[ViralWorks] Yêu cầu cập nhật link facebook';
                templatePath = process.cwd() + '/Resources/Views/Mail/Kol/update_facebook_link.pug';
                mailStatus = 3;
                break;
            default:
                throw new NotFound('Not found path template');
        }
        return {
            subject: subject,
            templatePath: templatePath,
            mailStatus: mailStatus
        }
    }

    private async createDataMail(email: string, messageId: string, statusCode: number) {
        if (statusCode >= 200 && statusCode < 300) {
            const data = {
                message_id: messageId,
                email: email,
                status: MailStatus.Success 
            };
            return this._mailModel.create(<IMail>data);
        }
        throw new InternalError('Mail code error');
    }

    public async addEventsMail(dataEvents: Array<object>) {
        const result: Array<object> = [];
        for (const dataEvent of dataEvents) {
            const message_id = dataEvent['sg_message_id'].split('.')[0];
            const mail = await this._mailModel.findOne({ message_id: message_id });
            if (mail) {
                const data = {
                    event: dataEvent['event'],
                    timestamp: dataEvent['timestamp']
                }
                mail.events.push(<IEventMail>data);
                _.set(mail, 'event_latest', dataEvent['event']);
                result.push(await mail.save());
            }
        }
        return result;
    }
}
