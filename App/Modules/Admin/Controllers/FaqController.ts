import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { FaqService } from '../Services/FaqService';
import { Conflict, InternalError } from 'System/Error';

import { IQueryArraySchema } from 'System/Interface/Swagger';

@Injectable
export class FaqController {
    constructor(private readonly _faqService: FaqService) { }
    
    public readonly getFaqs: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const contacts = await this._faqService.findByCondition(req.query);
            return res.json(contacts);
        },
        validation: {
            query: {
                page: {
                    type: DataType.String,
                    description: 'page of faq list'
                },
                limit: {
                    type: DataType.String,
                    description: 'number of returned faqs'
                },
                type: {
                    type: DataType.String,
                    enum: [0, 1, 2],
                    description: 'type of faq'
                }
            }
        },
        document: {
            tags: ['Faq Manager'],
            summary: 'Get list faq by condition',
            security: true,
            responses: {
                200: 'list faq is successful'
            }
        }
    }

    public readonly createFaq: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._faqService.create(req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    question: {
                        type: DataType.String,
                        required: true
                    },
                    answer: {
                        type: DataType.String,
                        required: true
                    },
                    type: {
                        type: DataType.Number,
                        enum: [0, 1, 2],
                        required: true
                    }   
                }
            }
        },
        document: {
            tags: ['Faq Manager'],
            responses: {
                200: 'Faq was created successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Create a new faq'
        }
    };

    public readonly updateFaq: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._faqService.updateFaq(req.params.id, req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    question: {
                        type: DataType.String,
                    },
                    answer: {
                        type: DataType.String,
                    },
                    type: {
                        type: DataType.Number,
                        enum: [0, 1, 2]
                    },
                    status: {
                        type: DataType.Number,
                        enum: [0, 1, 2]
                    }
                }
            }
        },
        document: {
            tags: ['Faq Manager'],
            responses: {
                200: 'Faq was updated successfully',
                201: 'Faq was updated successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Update status of faq'
        }
    };
}