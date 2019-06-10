import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { Request, Response } from 'express';
import { DataType } from 'System/Enum';
import * as RE from 'System/RegularExpression';
import { JobInviteService } from '../Services/JobInviteService';

@Injectable
export class JobInviteController {
    constructor(private _jobInviteService: JobInviteService) {}

    actionInviteKol: IHandler = {
        method: async(req: Request, res: Response) => {
            return res.json(await this._jobInviteService.sendInvite(req.auth.id, req.params.id, true));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    description: 'Job id'
                }
            }
        },
        document: {
            tags: ['Admin Job Invite'],
            summary: 'Send invite job to kol',
            security: true,
            responses: {
                200: 'Kol was invited'
            }
        }
    };

    actionInviteDetail: IHandler = {
        method: async(req: Request, res: Response) => {
            return res.json(await this._jobInviteService.inviteDetail(req.params.invite_id));
        },
        validation: {
            path: {
                invite_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    description: 'Invite id'
                }
            }
        },
        document: {
            tags: ['Admin Job Invite'],
            summary: 'Get detail invite',
            security: true,
            responses: {
                200: 'Invite found'
            }
        }
    };

    actionRejectInvite: IHandler = {
        method: async(req: Request, res: Response) => {
            return res.json(await this._jobInviteService.rejectInvite(req.auth.id, req.params.invite_id, req.body.reason));
        },
        validation: {
            path: {
                invite_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    description: 'Job id'
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    reason: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Admin Job Invite'],
            summary: 'Send invite job to kol',
            security: true,
            responses: {
                200: 'Kol was rejected'
            }
        }
    };

    actionReinvteKol: IHandler = {
        method: async(req: Request, res: Response) => {
            return res.json(await this._jobInviteService.reinviteKol(req.auth.id, req.params.invite_id));
        },
        validation: {
            path: {
                invite_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    description: 'Job id'
                }
            }
        },
        document: {
            tags: ['Admin Job Invite'],
            summary: 'Send invite job to kol',
            security: true,
            responses: {
                200: 'Kol was reinvited'
            }
        }
    }
}