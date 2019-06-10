import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import * as Queue from 'bull';
import { Config } from 'System/Config';
import { sleep } from 'System/Helpers/Misc';
import { MailModel, MailStatus } from 'App/Models/MailModel';
import * as _ from 'lodash';
import { MailStateContext } from 'Facade/MailState/MailStateContext';

require('System/Helpers/Log');

@Injectable
export class EmailQueue implements ICommand {
    constructor(private _config: Config, private _mailModel: MailModel, private _mailContext: MailStateContext) {}

    public run() {
        console.log('Email Queue is initializing...');

        var emailQueue = new Queue('email', {
            redis: {
                port: this._config.redis.port,
                host: this._config.redis.host,
                password: this._config.redis.password
            },
            limiter: {
                duration: this._config.mail_queue.rate_duration,
                max: this._config.mail_queue.max
            }
        });

        emailQueue.process(async (job, done) => {
            await this.sendMail(job.data).catch(err => console.log(`ERR: ${err}`));
            done();
        });

        emailQueue
            .on('completed', (job, result) => {
                console.log(
                    `Email ${job.data.receiverEmail} type ${job.data.mailType} completed with result ${result}`
                );
            })
            .on('error', function(error) {
                console.log(`ERR: ${error}`);
            })
            .on('failed', function(job, err) {
                console.log(`Email ${job.data.receiverEmail} type ${job.data.mailType} failed with result ${err}`);
            });

        console.log('Email Queue is initializing... DONE');
    }

    async sendMail(mail) {
        let result = await this._mailContext.sendMail(mail.mailType, mail.receiverEmail, mail.receiveName, mail.data);

        const messageId = _.get(result[0], 'headers.x-message-id', null);
        const statusCode = _.get(result[0], 'statusCode', 400);

        let mailRecord = await this._mailModel.findOne(mail.ref_id);

        if (!mailRecord) throw new Error('No mail record found');

        mailRecord.status = statusCode >= 200 && statusCode < 300 ? MailStatus.Success : MailStatus.Fail;
        mailRecord.message_id = messageId;

        await mailRecord.save();

        await sleep(1000);
    }
}
