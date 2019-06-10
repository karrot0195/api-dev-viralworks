import { Injectable } from '../Injectable';
import * as Queue from 'bull';
import * as _ from 'lodash';
import { Config } from '../Config';
import { ClientSession } from 'mongoose';
import { MailStatus, MailModel, IMail, mailCron } from 'App/Models/MailModel';
import { InternalError } from 'System/Error/InternalError';
import { generateJobId } from 'System/Helpers/Misc';

@Injectable
export class MailProducer {
    private _queue;
    constructor(private readonly _config: Config, private readonly _mailModel: MailModel) {
        console.log('Mail Producer is loading...');

        this._queue = new Queue('email', {
            redis: {
                port: this._config.redis.port,
                host: this._config.redis.host,
                password: this._config.redis.password
            }
        });

        console.log('Mail Producer is loading... DONE');
    }

    async send(mailType: number, receiverEmail: string, receiveName: string, data: object = {}) {
        const mail = await this.createDataMail(mailType, receiverEmail);

        if (mailCron.has(mailType)) {
            await this.mergeMail(mailType, receiverEmail, receiveName, data, mail.id);

            return { message_id: mail.id };
        }

        await this._queue.add({
            mailType,
            receiverEmail,
            receiveName,
            data,
            refId: mail.id
        });

        return { message_id: mail.id };
    }

    private async createDataMail(mailType: number, email: string) {
        const data = {
            email: email,
            mail_type: mailType,
            status: MailStatus.Waiting
        };
        return this._mailModel.create(<IMail>data);
    }

    private async mergeMail(mailType: number, receiverEmail: string, receiveName: string, data: any, refId: string) {
        if (data.listValue === undefined) throw new InternalError('WRONG_MAIL_FORMAT');

        let jobId = generateJobId(receiverEmail, mailType);

        let waitingJob = await this._queue.getDelayed();

        let sameJob: any = _(waitingJob)
            .filter(obj => obj.data.mailType === mailType && obj.data.receiverEmail === receiverEmail)
            .toArray()
            .value();

        if (sameJob.length > 0) {
            let newData = { listValue: sameJob[0].data.data.listValue.concat(data.listValue) };

            await sameJob[0].update({
                mailType,
                receiverEmail,
                receiveName,
                data: newData,
                refId
            });
        } else {
            await this._queue.add(
                jobId,
                {
                    mailType,
                    receiverEmail,
                    receiveName,
                    data,
                    refId
                },
                mailCron.get(mailType)
            );
        }
    }
}
