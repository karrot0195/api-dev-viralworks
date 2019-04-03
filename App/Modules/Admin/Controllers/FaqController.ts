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
    constructor(private readonly _faqService: FaqService) {}

    public readonly getFaqs: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const contacts = await this._faqService.findByCondition(req.query);
            return res.status(200).json(contacts);
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: field1|asc,field2|desc )',
                    pattern: RE.checkSortArrayString.source
                },
                page: {
                    type: DataType.Number,
                    description: 'Page number of result',
                    default: 0
                },
                limit: {
                    type: DataType.Number,
                    description: 'Limit per page',
                    default: 0
                },
                term: {
                    type: DataType.String,
                    description: 'Term that will be searched on all fields',
                    pattern: RE.checkString.source
                },
                value: {
                    type: DataType.String,
                    description: 'List of exact match value. (example: field1|value1,field|value2 )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: field1,field2 )',
                    pattern: RE.checkFields.source
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
    };

    public readonly createFaq: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._faqService.create(req.body));
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
            return res.status(200).json(await this._faqService.updateFaq(req.params.id, req.body));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    question: {
                        type: DataType.String
                    },
                    answer: {
                        type: DataType.String
                    },
                    type: {
                        type: DataType.Number,
                        enum: [0, 1, 2]
                    },
                    status: {
                        type: DataType.Number,
                        enum: [0, 1]
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

    public readonly removeFaq: IHandler = {
        method: async (req: Request, res: Response) => {
            const faq = await this._faqService.findById(req.params.id);
            if (faq) {
                return res.status(200).json(await faq.remove());
            }
            throw new NotFound('Not found faq');
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Faq Manager'],
            responses: {
                200: 'Faq was delete successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Delete faq'
        }
    };
}
