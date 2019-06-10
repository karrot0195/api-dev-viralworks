import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { RequestPaymentService } from 'App/Modules/PaymentRequest/Services/Admin/RequestPaymentService';
import { DataType } from 'System/Enum/Swagger';
import * as RE from 'System/RegularExpression';
import { BadRequest } from 'System/Error/BadRequest';

@Injectable
export class RequestPaymentController {
    constructor(private _requestSerice: RequestPaymentService) {}

    public actionGetList: IHandler = {
        method: async(req: Request, res: Response) => {
            res.json(await this._requestSerice.getListByCondition(req.query));
        },
        validation: {
            query: {
                page: {
                    type: DataType.String,
                    description: 'Page number of result',
                    pattern: RE.checkNumberString.source
                },
                limit: {
                    type: DataType.String,
                    description: 'Limit per page',
                    pattern: RE.checkNumberString.source
                }
            }
        },
        document: {
            tags: [ 'Admin Manager' ],
            summary: 'Get list request payment',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionProcessRequest: IHandler = {
        method: async(req: Request, res: Response) => {
            const action = req.params.action;
            if (action == 'accept') {
                res.json({success: await this._requestSerice.acceptRequest(req.auth.id, req.params.id)});
            } else {
                const reason = req.body.reason;
                if (!reason) throw new BadRequest({
                    fields: { reason: 'REASON_FIELD_REQUIRED' }
                });
                res.json({success: await this._requestSerice.rejectRequest(req.auth.id, req.params.id, reason)});
            }

        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                action: {
                    type: DataType.String,
                    enum: ['accept', 'reject']
                }
            }
        },
        document: {
            tags: [ 'Admin Manager' ],
            summary: 'Get list request payment',
            responses: {
                200: 'successfully'
            }
        }
    }
}