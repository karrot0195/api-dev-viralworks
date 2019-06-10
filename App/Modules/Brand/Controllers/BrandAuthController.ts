import { Request, Response, NextFunction } from 'express';

import { Unauthorized } from 'System/Error/Unauthorized';
import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { BrandAuthService } from '../Services/BrandAuthService';
import { getAvatarUrlInfo } from 'App/Helpers/Format';
import * as RE from 'System/RegularExpression';

@Injectable
export class BrandAuthController {
    constructor(private readonly _authServ: BrandAuthService) {}

    private avatarBasePath = '/brand/brands/';

    postLogin: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            const result = await this._authServ.login(
                req.body.email,
                req.body.password,
                req.body.remember,
                avatarUrlInfo
            );

            if (!result) {
                throw new Unauthorized('UNAUTHORIZED_LOGIN');
            } else {
                return res.status(200).json(result);
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        format: FormatType.Email,
                        required: true
                    },
                    password: {
                        type: DataType.String,
                        required: true
                    },
                    remember: {
                        type: DataType.Integer
                    }
                }
            }
        },
        document: {
            tags: ['Brand Authentication'],
            summary: 'Create an authentication token for brand',
            responses: {
                201: 'Created Token',
                401: 'Login Failed'
            }
        }
    };

    getCheckToken: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            return res.status(200).json(await this._authServ.getBrandInfo(req.auth.id, avatarUrlInfo));
        },
        document: {
            tags: ['Brand Authentication'],
            summary: 'Check if token is still valid',
            responses: {
                200: 'Token is valid',
                401: 'Token is invalid'
            },
            security: true
        }
    };

    public readonly requestResetPassword: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._authServ.requestResetPassword(req.body.email));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        required: true,
                        format: FormatType.Email
                    }
                }
            }
        },
        document: {
            tags: ['Brand Authentication'],
            summary: 'Request reset password'
        }
    };

    public readonly getResetPasswordTokenInfo: IHandler = {
        method: async (req: Request, res: Response) => {
            return res
                .status(200)
                .json(await this._authServ.getResetPasswordTokenInfo(req.query.email, req.query.token));
        },
        validation: {
            query: {
                email: {
                    type: DataType.String,
                    format: FormatType.Email,
                    required: true
                },
                token: {
                    type: DataType.String,
                    required: true
                }
            }
        },
        document: {
            tags: ['Brand Authentication'],
            summary: 'Check reset password token'
        }
    };

    public readonly resetPassword: IHandler = {
        method: async (req: Request, res: Response) => {
            return res
                .status(200)
                .json(await this._authServ.resetPassword(req.query.email, req.query.token, req.body.password));
        },
        validation: {
            query: {
                email: {
                    type: DataType.String,
                    format: FormatType.Email,
                    required: true
                },
                token: {
                    type: DataType.String,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    password: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkPassword.source
                    }
                }
            }
        },
        document: {
            tags: ['Brand Authentication'],
            summary: 'Reset password'
        }
    };
}
