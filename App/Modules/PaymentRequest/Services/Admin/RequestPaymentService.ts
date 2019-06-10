import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { RequestPaymentModel, RequestPaymentStatus } from 'App/Models/RequestPaymentModel';
import { NotFound } from 'System/Error/NotFound';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { MailService } from 'App/Modules/Admin/Services/MailService';
import { MailType } from 'App/Models/MailModel';
import { ClientSession } from 'mongoose';

@Injectable
export class RequestPaymentService {
    constructor(private _mongo: Mongo, private _requestPaymentModel: RequestPaymentModel, private mail: MailService) {}

    public getListByCondition(conditions: object) {
        const KolField = ['facebook.name', 'email', 'payment_info', 'delivery_info'];
        return this._requestPaymentModel.findWithFilter(conditions, [], undefined, [
            { path: 'kol_id', select: KolField }
        ]);
    }

    public async acceptRequest(causerId: string, rId: string) {
        return this._mongo.transaction(async session => {
            const request = await this._findRequestById(rId);
            request.status = RequestPaymentStatus.Accept;
            await this._notifyToKol(causerId, <string>request.kol_id, request.price, 'accept', session);
            await request.save();
            return true;
        });
    }

    public async rejectRequest(causerId: string, rId: string, reason: string) {
        return this._mongo.transaction(async session => {
            const request = await this._findRequestById(rId);
            if (!request.kol_id) throw new NotFound('KOL_USER_NOT_FOUND');
            request.status = RequestPaymentStatus.Reject;
            request.reason = reason;
            // back amount
            const kol = <KolUser>request.kol_id;
            kol.income.approved += request.price;
            await kol.save({ session: session });
            await this._notifyToKol(causerId, <string>request.kol_id, request.price, 'reject', session);
            await request.save({ session: session });
            return true;
        });
    }

    private async _findRequestById(rId: string) {
        const request = await this._requestPaymentModel.findById(rId).populate('kol_id');
        if (!request) throw new NotFound('REQUEST_PAYMENT_NOT_FOUND');
        return request;
    }

    private async _notifyToKol(causerId: string, kId: string, price: number, type: string, session: ClientSession) {
        if (type == 'accept') {
            return this.mail.excuteSendMailKol(
                causerId,
                kId,
                MailType.ACCEPT_REQUEST_PAYMENT,
                { price: price },
                session
            );
        } else {
            return this.mail.excuteSendMailKol(
                causerId,
                kId,
                MailType.REJECT_REQUEST_PAYMENT,
                { price: price },
                session
            );
        }
    }
}
