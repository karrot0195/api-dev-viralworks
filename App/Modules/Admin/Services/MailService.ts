import { Injectable } from 'System/Injectable';
import { NotFound, InternalError } from 'System/Error';
import { KolUserModel } from 'App/Models/KolUserModel';
import { MailModel, IMail, MailStatus, IEventMail, MailType } from 'App/Models/MailModel';
import * as _ from 'lodash';
import { Mongo } from 'System/Mongo';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { HistoryActionModel, HistoryActionType } from 'App/Models/HistoryActionModel';
import { ClientSession } from 'mongodb';
import { IEmailData } from 'Facade/MailState/Interfaces/IMailState';
import { MailProducer } from 'System/Mail/MailProducer';

@Injectable
export class MailService {
    constructor(
        private readonly _kolModel: KolUserModel,
        private readonly _mailModel: MailModel,
        private readonly _mongo: Mongo,
        private readonly _mailProducer: MailProducer,
        private readonly _historyActionModel: HistoryActionModel
    ) {}

    async sendMailTemplateKol(causerId: string, kolId: string, mailType: number, data?: object) {
        return this._mongo.transaction(async session =>
            this.excuteSendMailKol(causerId, kolId, mailType, data, session)
        );
    }

    public async excuteSendMailKol(
        causerId: string,
        kolId: string,
        mailType: number,
        data?: object,
        session?: ClientSession
    ) {
        const kolUser = await this._kolModel.findById(kolId);
        if (!kolUser) throw new NotFound('KOL_USER_NOT_FOUND');
        if (!kolUser.email) throw new InternalError('EMAIL_FIELD_NOT_FOUND');

        const email = kolUser['email'];

        const kolName = _.get(kolUser, 'facebook.name', 'kol');

        const mail: any = await this._mailProducer.send(mailType, email, kolName, data);

        await this.addHistoryToKol(
            kolUser,
            {
                causer_id: causerId,
                type: HistoryActionType.Mail,
                kol_status: kolUser.status,
                ref_id: mail.message_id
            },
            session
        );

        return { message_id: mail.message_id };
    }

    private async addHistoryToKol(kolUser: KolUser, data: any, session?: ClientSession) {
        const history = await this._historyActionModel.create(data, session);
        kolUser.histories.push(history._id);
        return await kolUser.save({ session });
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
                };
                mail.events.push(<IEventMail>data);
                _.set(mail, 'event_latest', dataEvent['event']);
                result.push(await mail.save());
            }
        }
        return result;
    }

    /**
     * Send mail
     *
     * @param {number} mailType - type of email
     * @param {IEmailData} data - Data to fill into mail form
     * @param {ClientSession} session - Optional. In case need transaction
     *
     * @return {Object} mail id in database
     */
    async send(mailType: number, data: IEmailData) {
        const mailId = await this._mailProducer.send(mailType, data.address, data.name, data.payload);

        return { message_id: mailId };
    }
}
