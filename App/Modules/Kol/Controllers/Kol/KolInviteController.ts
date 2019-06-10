import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { KolInviteService } from 'App/Modules/Kol/Services/Kol/KolInviteService';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { DataType } from 'System/Enum/Swagger';
import * as RE from 'System/RegularExpression';
import { JobService } from 'App/Modules/Job/Services/JobService';

@Injectable
export class KolInviteController {
    constructor(readonly mongo: Mongo, readonly kolInviteService: KolInviteService, readonly jobService: JobService) {}

    public actionJoinJob: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this.kolInviteService.joinJob(req.auth.id, req.params.id, req.body));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    time: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source,
                        required: true
                    },
                    questions: {
                        type: DataType.Array,
                        items: {
                            type: DataType.Object,
                            properties: {
                                id: {
                                    type: DataType.String,
                                },
                                answer: {
                                    type: DataType.Number
                                }
                            }
                        },
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Invite Manager'],
            summary: 'Join job'
        }
    };

    public actionGetInviteList: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this.kolInviteService.getInviteList(req.auth.id));
        },
        validation: {
        },
        document: {
            tags: ['Kol Invite Manager'],
            summary: 'Get list invite'
        }
    };

    public actionGetInvite: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this.kolInviteService.getDetailInvite(req.auth.id, req.params.id));
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
            tags: ['Kol Invite Manager'],
            summary: 'Get list invite'
        }
    };

    public actionRenderAttachment: IHandler = {
        method: async (req: Request, res: Response) => {
            const data = await this.jobService.getAttachment(req.params.job_id, req.params.attachment_name);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        },
        validation: {
            path: {
                job_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                attachment_name: {
                    type: DataType.String,
                    enum: ['cover_image', 'sample_post']
                }
            }
        },
        document: {
            tags: ['Kol Invite Manager'],
            summary: 'Render attachment image'
        }
    };

    public actionRejectInvite: IHandler = {
        method: async(req: Request, res: Response) => {
            return res.json(await this.kolInviteService.rejectInvite(req.auth.id, req.params.invite_id, req.body.reason));
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
}
