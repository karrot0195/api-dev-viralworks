import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { PaymentService } from 'App/Modules/PaymentRequest/Services/Kol/PaymentService';

@Injectable
export class RequestPaymentController {
    constructor(readonly paymentService: PaymentService) {}

    public actionCreatePaymentRequest: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({
                success: await this.paymentService.createRequestPayment(req.auth.id)
            });
        },
        validation: {

        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Create payment request',
            responses: {
                201: 'Created'
            }
        }
    };

    public actionCheckCreateRequest: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({
                success: await this.paymentService.checkCreateRequest(req.auth.id)
            });
        },
        validation: {

        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Create payment request',
            responses: {
                201: 'Created'
            }
        }
    };

    public actionGetListRequest: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json( await this.paymentService.getRequests(req.auth.id));
        },
        validation: {

        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Create payment request',
            responses: {
                201: 'Created'
            }
        }
    };

}
