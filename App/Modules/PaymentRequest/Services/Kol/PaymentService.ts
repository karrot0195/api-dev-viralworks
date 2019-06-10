import { Injectable } from 'System/Injectable';
import { IKolUser, KolUserModel } from 'App/Models/KolUserModel';
import { NotFound } from 'System/Error/NotFound';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { getLimitPricePayment } from 'App/Helpers/Generator';
import { Forbidden } from 'System/Error/Forbidden';
import { RequestPaymentModel } from 'App/Models/RequestPaymentModel';
import { ClientSession } from 'mongoose';
import { HistoryActionModel, HistoryActionType, IHistoryAction, ReasonMessage } from 'App/Models/HistoryActionModel';
import { Mongo } from 'System/Mongo';
import { HistoryAction } from 'Database/Schema/HistoryActionSchema';

@Injectable
export class PaymentService {
    constructor(
        readonly mongo: Mongo,
        readonly kolUserModel: KolUserModel,
        readonly requestPaymentModel: RequestPaymentModel,
        readonly historyActionModel: HistoryActionModel
    ) {}

    public async createRequestPayment(kId: string) {
        const kolUser = <KolUser>await this._findKolUserById(kId);
        const amount = kolUser.income.approved;
        if (!this._checkPricePayment(amount)) {
            throw new Forbidden('NOT_ENOUGH_MONEY');
        }

        if (!await this._checkPendingRequest(kId)) {
            throw new Forbidden('REQUEST_PAYMENT_EXISTS');
        }

        return this.mongo.transaction(async session => {
            // create request
            const requestPayment = await this._createRequestPayment(kId, amount, session);
            kolUser.income.approved = 0;
            const history = await this.historyActionModel.create(
                {
                    kol_id: kId,
                    reason: ReasonMessage.RequestPayment,
                    type: HistoryActionType.RequestPayment,
                    ref_id: requestPayment._id
                },
                session
            );

            // add history
            kolUser.histories.push(history._id);
            // notify
            this._notifyToKolUser();
            await kolUser.save({ session: session });
            return true;
        });
    }

    public async checkCreateRequest(kId) {
        const kolUser = <KolUser>await this._findKolUserById(kId);
        const amount = kolUser.income.approved;
        if (!this._checkPricePayment(amount)) {
            throw new Forbidden('NOT_ENOUGH_MONEY');
        }

        if (!await this._checkPendingRequest(kId)) {
            throw new Forbidden('REQUEST_PAYMENT_EXISTS');
        }

        return true;
    }

    public async getRequests(kId: string) {
        return this.requestPaymentModel.find({
            kol_id: kId
        });
    }

    private _createRequestPayment(kol_id: string, price: number, session?: ClientSession) {
        return this.requestPaymentModel.create(
            {
                kol_id: kol_id,
                price: price
            },
            session
        );
    }

    private async _checkPendingRequest(kId: string) {
        return new Promise(res => {
            this.requestPaymentModel.find({ kol_id: kId }).count(function(err, count) {
                res(count == 0);
            });
        });
    }

    private _checkPricePayment(price: number): boolean {
        return price > getLimitPricePayment();
    }

    private async _findKolUserById(id: string, customQuery?: Function) {
        const query = this.kolUserModel.findById(id);
        if (customQuery) {
            customQuery(query);
        }
        const kolUser = await query;
        if (!kolUser) throw new NotFound('KOL_USER_NOT_FOUND');
        return kolUser;
    }

    //
    private _notifyToKolUser() {}
}
