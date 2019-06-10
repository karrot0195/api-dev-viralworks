import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType } from 'System/Enum';
import { Forbidden, NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { KolManagerService } from '../../Services/Admin/KolManagerService';
import { KolInfoStatus } from 'App/Models/KolUserModel';
import {
    PaginationValidator,
    UFacebookValidator,
    UInfoBaseValidator,
    UKolEvaluteValidator
} from 'App/Constants/KolValidator';

@Injectable
export class KolManagerController {
    constructor(private readonly _kolAuthService: KolManagerService) {}

    public readonly actionCreateKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.create(req.body));
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
            tags: ['Admin Manager'],
            summary: 'create new kol user',
            security: true,
            responses: {
                200: 'Kol user was created successfully'
            }
        }
    };

    public readonly actionRemoveKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            if (process.env.ENV == 'production') {
                throw new Forbidden('FEATURE_NOT_ENABLE');
            }
            return res.json({
                success: await this._kolAuthService.removeKoluser(req.params.id)
            });
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
            tags: ['Admin Manager'],
            summary: 'Delete kol user',
            security: true,
            responses: {
                200: 'Kol user was deleted successfully'
            }
        }
    };

    public readonly actionGetKolUsers: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.findCondition(req.query));
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'get list kol register by condition',
            security: true,
            responses: {
                200: 'Found data'
            }
        },
        validation: {
            query: <any>PaginationValidator
        }
    };

    public readonly actionGetKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const embedded = _.get(req.query, 'fields', '');
            var fields: Array<string> = [];
            if (embedded) {
                fields = embedded.trim().split(',');
            }
            const query = this._kolAuthService.findById(req.params.id);
            query.select(fields);
            if (fields.length == 0 || fields.indexOf('histories') > -1) {
                query.populate('histories');
            }
            const kolUser = await query;
            if (!kolUser) throw new NotFound('KOL_USER_NOT_FOUND');
            var data: any = await this._kolAuthService.embeddedsVirtual(kolUser);
            return res.json(data);
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'get info of kol user',
            security: true,
            responses: {
                200: 'Get a kol user by specified ID'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            },
            query: {
                fields: {
                    type: DataType.String,
                    description: 'fields result'
                }
            }
        }
    };

    public readonly getHistoryAction: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.getHistoryAction(req.params.id, parseInt(req.query.page), parseInt(req.query.limit), req.query.sort));
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'Get kol history',
            security: true,
            responses: {
                200: 'Found'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            },
            query:{
                page: {
                    type: DataType.String,
                    pattern: RE.checkNumberString.source
                },
                limit: {
                    type: DataType.String,
                    pattern: RE.checkNumberString.source
                },
                sort: {
                    type: DataType.String,
                    enum: ['desc', 'asc']
                }
            }
        }
    };

    public readonly actionGetKolMails: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.getMails(req.params.id));
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'Get kol mails',
            security: true,
            responses: {
                200: 'Mails found'
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
        }
    };

    public readonly actionUpdateKolInfoBase: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                return res.json(await this._kolAuthService.updateBasicInfo(kolUser, req.body));
            }
            throw new NotFound('KOL_USER_NOT_FOUND');
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'update base info',
            security: true,
            responses: {
                200: 'Kol user was updated successfully'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            },
            body: {
                type: DataType.Object,
                properties: <any>UInfoBaseValidator
            }
        }
    };

    public readonly actionUpdateKolInfoFacebook: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                return res.json(await this._kolAuthService.updateFacebookInfo(kolUser, req.body));
            }
            throw new NotFound('KOL_USER_NOT_FOUND');
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'update info facebook',
            security: true,
            responses: {
                200: 'Kol user was updated successfully'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: <any>UFacebookValidator
            }
        }
    };

    public readonly actionGetOptionEvaluate: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const embedded = _.get(req.query, 'fields', '');
            var fields: Array<string> = [];
            if (embedded) {
                fields = embedded.trim().split(',');
            }

            return res.json(this._kolAuthService.getEvaluateOption(fields));
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'get option evaluate',
            security: true,
            responses: {
                200: 'Found data'
            }
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    default: ''
                }
            }
        }
    };

    public readonly actionUpdateKolInfoEvaluate: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.updateEvaluateInfo(req.auth.id, req.params.id, req.body));
        },
        document: {
            tags: ['Admin Manager'],
            summary: 'update evaluate info',
            security: true,
            responses: {
                200: 'Kol evaluate info was updated successfully'
            }
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
                properties: <any>UKolEvaluteValidator
            }
        }
    };

    public readonly actionUpdateKolInfoStatus: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                const status = parseInt(req.params.status);
                var result: Object = {};
                if (status === KolInfoStatus.Verified) {
                    result = await this._kolAuthService.verifyKolInfo(kolUser, req.auth.id);
                } else if (status === KolInfoStatus.Rejected) {
                    result = await this._kolAuthService.rejectKolInfo(kolUser, req.auth.id, req.body);
                }
                return res.json(result);
            }
            throw new NotFound('KOL_USER_NOT_FOUND');
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                status: {
                    type: DataType.Number,
                    required: true,
                    enum: [KolInfoStatus.Verified, KolInfoStatus.Rejected]
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    reason_id: {
                        type: DataType.String
                    },
                    description: {
                        type: DataType.String
                    }
                }
            }
        },
        document: {
            tags: ['Admin Manager'],
            security: true,
            summary: 'update kol info status',
            responses: {
                200: 'Kol info status was updated successfully'
            }
        }
    };

    public readonly actionUpdateEngagement: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.updateEngagement(req.params.id));
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
            tags: ['Admin Manager'],
            security: true,
            summary: 'update engagement',
            responses: {
                200: 'Update engagement successful'
            }
        }
    };

    public readonly actionUpdateState: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.updateState(req.auth.id, req.params.id, req.params.state));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                state: {
                    type: DataType.String,
                    enum: ['enable', 'disable']
                }
            }
        },
        document: {
            tags: ['Admin Manager'],
            security: true,
            summary: 'Change status of kol',
            responses: {
                200: 'Updated'
            }
        }
    };
}
