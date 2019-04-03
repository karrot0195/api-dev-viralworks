import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { UserService } from '../Services/UserService';

@Injectable
export class UserController {
    constructor(private readonly _userServ: UserService) {}

    createUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(201).json(await this._userServ.create(req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkString.source
                    },
                    email: {
                        type: DataType.String,
                        required: true,
                        format: FormatType.Email
                    },
                    password: {
                        type: DataType.String,
                        required: true
                    },
                    role: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Create new user',
            security: true,
            responses: {
                201: 'User was created',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    updateUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._userServ.updateUserById(req.params.id, req.body));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        pattern: RE.checkString.source
                    },
                    email: {
                        type: DataType.String,
                        format: FormatType.Email
                    },
                    password: {
                        type: DataType.String
                    },
                    role: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source
                    },
                    isDisabled: {
                        type: DataType.Boolean
                    }
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Update user by specific Id',
            security: true,
            responses: {
                200: 'User was updated',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    getUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._userServ.findById(req.params.id, req.query.fields));
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    pattern: RE.checkFields.source
                }
            },
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Get a user by specified Id',
            security: true,
            responses: {
                200: 'Found User',
                404: 'Not Found User'
            }
        }
    };
}
