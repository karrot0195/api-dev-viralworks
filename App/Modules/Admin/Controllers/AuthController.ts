import { Request, Response, NextFunction } from 'express';

import { Unauthorized } from 'System/Error/Unauthorized';
import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { AuthService } from '../Services/AuthService';

@Injectable
export class AuthController {
    constructor(private readonly _authServ: AuthService) {}

    postLogin: IHandler = {
        method: async (req: Request, res: Response) => {
            const result = await this._authServ.login(req.body.email, req.body.password, req.body.remember);

            if (result === false) {
                throw new Unauthorized('Login Failed');
            } else {
                return res.status(201).json(result);
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        format: FormatType.Email,
                        required: true,
                    },
                    password: {
                        type: DataType.String,
                        required: true,
                    },
                    remember: {
                        type: DataType.Integer,
                    },
                },
            },
        },
        document: {
            tags: ['Authentication'],
            summary: 'Create an authentication token',
            responses: {
                201: 'Created Token',
                401: 'Login Failed',
            },
        },
    };

    getCheckToken: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._authServ.getUserInfo(req.get('Authorization')));
        },
        document: {
            tags: ['Authentication'],
            summary: 'Check if token is still valid',
            responses: {
                200: 'Token is valid',
                401: 'Token is invalid',
            },
            security: true,
        },
    };
}
