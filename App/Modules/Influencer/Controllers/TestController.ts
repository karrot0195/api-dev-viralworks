import { Injectable } from 'System/Injectable';
import { Request, Response } from 'express';
import { Config } from 'System/Config';
import { DataType, FormatType } from 'System/Enum';
import { IHandler } from 'System/Interface';

@Injectable
export class TestController {
    constructor(readonly config: Config) { }

    public readonly postTest: IHandler = {
        method: this.postTestHandler.bind(this),
        validation: {
            path: {
                id: {
                    type: DataType.Number,
                    required: true,
                    minimum: 1,
                    maximum: 5,
                    exclusiveMaximum: true,
                    description: 'Test ID'
                }
            },
            query: {
                sort: {
                    type: DataType.Integer,
                    description: 'Sort Data',
                    enum: [-1, 1],
                    default: 1,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    username: {
                        type: DataType.String,
                        required: true
                    },
                    email: {
                        type: DataType.String,
                        required: true,
                        format: FormatType.Email
                    },
                    age: {
                        type: DataType.Object,
                        properties: {
                            dob: {
                                type: DataType.String,
                                format: FormatType.Date,
                                example: '2018-03-01'
                            },
                            yo: {
                                type: DataType.Integer,
                                required: true
                            }
                        }
                    },
                    school: {
                        type: DataType.Array,
                        items: {
                            type: DataType.Object,
                            title: 'School',
                            properties: {
                                name: {
                                    type: DataType.String,
                                    required: true
                                },
                                location: {
                                    type: DataType.String
                                }
                            }
                        }
                    }
                }
            }
        },
        document: {
            tags: ['Test'],
            responses: {
                200: 'Found data',
                403: 'Forbidden',
                406: 'Not Acceptable'
            },
            security: true
        }
    }

    private async postTestHandler(req: Request, res: Response) {
        return res.json({ path: req.params, body: req.body, query: req.query });
    }
}