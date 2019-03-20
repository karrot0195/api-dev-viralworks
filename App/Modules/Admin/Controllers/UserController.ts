import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { UserService } from '../Services/UserService';
import { Conflict, InternalError } from 'System/Error';

@Injectable
export class UserController {
    constructor(private readonly _userServ: UserService) { }

    createUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = await this._userServ.create(req.body);
                return res.status(201).json(user);
            } catch (err) {
                if (err.code == 11000) {
                    throw new Conflict('Duplicate Email');
                } else {
                    throw new InternalError(err);
                }
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true
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
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Create new user',
            security: true,
            responses: {
                201: 'User was created'
            }
        }
    }

    getUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const user = await this._userServ.findById(req.params.id);

            if (user) {
                return res.json(user);
            } else {
                return next(new NotFound('Not Found User'));
            }
        },
        validation: {
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
        },
        policy: async (req: Request) => {
            const user = await this._userServ.findById(req.params.id);
            if (user && req.auth.id == user.id) {
                return true;
            } else {
                return false;
            }
        }
    }
}