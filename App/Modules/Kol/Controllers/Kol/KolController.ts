import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { KolService } from 'App/Modules/Kol/Services/Kol/KolService';
import { DataType } from 'System/Enum/Swagger';

@Injectable
export class KolController {
    constructor(private _kolService: KolService) {}

    public actionUpdatePayment: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(
                await this._kolService.uploadPayment(req.auth.id, req.body.payment_info, req.body.delivery_info)
            );
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    payment_info: {
                        type: DataType.Object,
                        properties: {
                            account_name: {
                                type: DataType.String
                            },
                            account_id: {
                                type: DataType.String
                            },
                            bank_name: {
                                type: DataType.String
                            },
                            bank_province: {
                                type: DataType.String
                            },
                            bank_branch: {
                                type: DataType.String
                            }
                        }
                    },
                    delivery_info: {
                        type: DataType.Object,
                        properties: {
                            city: {
                                type: DataType.String
                            },
                            district: {
                                type: DataType.String
                            },
                            address: {
                                type: DataType.String
                            }
                        }
                    }
                }
            }
        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Update payment info',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionUpdateJob: IHandler = {
        method: async (req: Request, res: Response) => {
            let jobs = [];
            let job_others = [];
            if (req.body.jobs) {
                jobs = req.body.jobs.split(',');
            }

            if (req.body.job_others) {
                job_others = req.body.job_others.split(',');
            }
            res.json(await this._kolService.uploadJob(req.auth.id, jobs, job_others));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    jobs: {
                        type: DataType.String,
                        required: true,
                        example: 'id1,id2,...'
                    },
                    job_others: {
                        type: DataType.String,
                        required: true,
                        example: 'job1,job2,...'
                    }
                }
            }
        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Update job',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionUpdateShareStory: IHandler = {
        method: async (req: Request, res: Response) => {
            let shareStories = [];
            let ShareStoryOthers = [];
            if (req.body.share_stories) {
                shareStories = req.body.share_stories.split(',');
            }

            if (req.body.share_story_others) {
                ShareStoryOthers = req.body.share_story_others.split(',');
            }
            res.json(await this._kolService.uploadShareStory(req.auth.id, shareStories, ShareStoryOthers));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    share_stories: {
                        type: DataType.String,
                        example: 'id1,id2,...',
                        required: true
                    },
                    share_story_others: {
                        type: DataType.String,
                        example: 'share_story1,share_story2,...',
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Update share story',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionUploadPrice: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._kolService.uploadPrice(req.auth.id, req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    photo: {
                        type: DataType.Number
                    },
                    livestream: {
                        type: DataType.Number
                    },
                    have_video: {
                        type: DataType.Number
                    },
                    share_link: {
                        type: DataType.Number
                    }
                }
            }
        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Update price',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    };

    public actionUpdateInfo: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._kolService.updateBasicInfo(req.auth.id, req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    sex: {
                        type: DataType.String,
                        enum: ['-1', '0', '1']
                    },
                    matrimony: {
                        type: DataType.String,
                        enum: ['-1', '0', '1']
                    },
                    mobile: {
                        type: DataType.String
                    },
                    dob: {
                        type: DataType.String,
                        pattern: /^[-\d]*$/.source
                    },
                    num_child: {
                        type: DataType.String,
                        enum: ['-1', '0', '1', '2', '3']
                    },
                    facebook_name: {
                        type: DataType.String
                    },
                    facebook_link: {
                        type: DataType.String
                    },
                    location: {
                        type: DataType.String
                    },
                    notification_job: {
                        type: DataType.Boolean
                    },
                    step: {
                        type: DataType.String
                    }
                }
            }
        },
        document: {
            tags: ['Kol Manager'],
            summary: 'Update basic information',
            security: true,
            responses: {
                200: 'successfully'
            }
        }
    }
}
