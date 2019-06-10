import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'node_modules/@types/express';
import { DataType } from 'System/Enum/Swagger';
import * as RE from 'System/RegularExpression';
import { PostPublishService } from 'App/Modules/Kol/Services/Kol/PostPublishService';

@Injectable
export class PostPushController {
    constructor(private postPushService: PostPublishService) {}

    public actionPublishContent: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this.postPushService.publishContent(req.params.job_id, req.body)
            });
        },
        validation: {
            path: {
                job_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    content: {
                        type: DataType.String,
                        required: true
                    },
                    attachments: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String
                        }
                    }
                }
            }
        },
        document: {
            tags: ['Kol Post Manager'],
            summary: 'Running content post',
            responses: {
                200: 'Content was published'
            }
        }
    };

    public actionViewAttachment: IHandler = {
        method: async (req: Request, res: Response) => {
            const data = await this.postPushService.renderAttachment(req.params.job_id, req.params.file_name);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        },
        validation: {
            path: {
                job_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                file_name: {
                    type: DataType.String
                }
            }
        },
        document: {
            tags: ['Kol Post Manager'],
            summary: 'View attachment post',
            responses: {
                200: 'succcessfully'
            }
        }
    };

    public actionPublishLink: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this.postPushService.publishLink(req.params.job_id, req.body.link)
            });
        },
        validation: {
            path: {
                job_id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    link: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Post Manager'],
            summary: 'Running link post',
            responses: {
                200: 'link was published'
            }
        }
    }
}