import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { AuthService } from 'App/Modules/Kol/Services/AuthService';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { DataType } from 'System/Enum/Swagger';
import { SocialLiteService } from 'App/Modules/Social/Services/SocialLiteService';

@Injectable
export class AuthenticationController {
    constructor(private _mongo: Mongo, private _authService: AuthService, private _socialService: SocialLiteService) {}

    public readonly actionRegisterKol: IHandler = {
        method: async (request: Request, response: Response) => {
            return response
                .status(201)
                .json(
                    await this._socialService.registerKolBySocial(
                        request.body.token,
                        request.body.email,
                        request.body.mobile,
                        request.body.password
                    )
                );
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'Register Kol',
            responses: {
                201: 'Created'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    token: {
                        type: DataType.String,
                        required: true
                    },
                    email: {
                        type: DataType.String,
                        required: true
                    },
                    password: {
                        type: DataType.String,
                        required: true
                    },
                    mobile: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        }
    };

    public actionGetInfo: IHandler = {
        method: async (req: Request, res: Response) => {
            var select:Array<string> = [];
            if (req.query.fields) {
                select = req.query.fields.split(',');
                select = select.filter(f => f != '' && f != 'password');
            } else {
                select.push('-password');
            }
            res.json(await this._authService.findKolUserById(req.auth.id, select));
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    example: 'email,summary_info'
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'kol info',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionPostLogin: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._authService.login(req.body.email, req.body.password, req.body.is_remeber));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        required: true
                    },
                    password: {
                        type: DataType.String,
                        required: true
                    },
                    is_remember: {
                        type: DataType.Number
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'kol login',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionChangePassword: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({ success: await this._authService.changePassword(req.auth.id, req.body.current_password, req.body.new_password) });
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    current_password: {
                        type: DataType.String,
                        required: true
                    },
                    new_password: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'kol change password',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionSendMailVerify: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({ success: await this._authService.sendMailVerify(req.body.email) });
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            security: true,
            summary: 'Send mail verify',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionCheckAuth: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(req.auth);
        },
        validation: {
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'Check token',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionForgotPassword: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({
                success: await this._authService.sendMailForgotPassword(req.body.email)
            })
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'Forgot password',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionRecoveryPassword: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({ success: await this._authService.changePasswordbyToken(req.body.token, req.body.new_password) });
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    token: {
                        type: DataType.String,
                        required: true
                    },
                    new_password: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'kol recovery password',
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionVerifyEmail: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json({ success: await this._authService.verifyEmail(req.body.token) });
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    token: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Authenticate Manager'],
            summary: 'kol verify email',
            responses: {
                200: 'successfully'
            }
        }
    };
}
