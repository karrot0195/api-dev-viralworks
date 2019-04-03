import { Injectable } from 'System/Injectable';
import { MailService } from '../Services/MailService';
import { IHandler } from 'System/Interface';
import { DataType } from 'System/Enum';
import { checkMongoId } from 'System/RegularExpression';
import { NextFunction, Request, Response } from 'express';
import { InternalError } from 'System/Error';

@Injectable
export class KolMailController {
    constructor(private readonly _mailService: MailService) {}

    public readonly sendMail: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            try {
                return res.status(200).json(await this._mailService.sendMailTemplateKol(req.auth.id, req.params.id, req.params.type));
            } catch(err) {
                throw new InternalError(err.message);
            }
        },
        validation: {
            path: {
                type: {
                    title: 'Type of email',
                    description: '1: mail reject, 2: mail verify, 3: mail update facebook link',
                    example: '1',
                    type: DataType.Number,
                    enum: [1, 2, 3]
                },
                id: {
                    type: DataType.String,
                    pattern: checkMongoId.source
                }
            }
        },
        document: {
            summary: 'Send mail template for kol user',
            tags: ['Mail Template'],
            security: true,
            responses: {
                200: 'Mail was sent successfully'
            }
        }
    };

    public readonly  hookMail: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._mailService.addEventsMail(req.body));
        },
        validation: {
            body: {
                type: DataType.Array,
                items: {
                    type: DataType.Object,
                    properties: {
                        email: {
                            type: DataType.String,
                        },
                        event: {
                            type: DataType.String,
                        },
                        sg_message_id: {
                            type: DataType.String
                        },
                        timestamp: {
                            type: DataType.Number
                        }
                    }
                }
            }
        },
        document: {
            summary: 'Send mail template for kol user',
            tags: ['Mail Template'],
            security: true,
            responses: {
                200: 'Mail was sent successfully'
            }
        }
    }
}
