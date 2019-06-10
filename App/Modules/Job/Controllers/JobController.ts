import { Injectable } from 'System/Injectable';
import { IHandler, IObjectOfArraySchema } from 'System/Interface';
import { Request, Response } from 'express';
import { CJobValidator, UJobValidator } from 'App/Constants/JobValidate';
import { DataType } from 'System/Enum';
import * as RE from 'System/RegularExpression';
import { IJob } from 'App/Models/JobModel';
import { getOptionsTag } from 'App/Helpers/Generator';
import { JobService } from '../Services/JobService';
import { NotFound } from 'System/Error/NotFound';

@Injectable
export class JobController {
    constructor(private readonly _jobService: JobService) {}

    /* GET */
    public readonly getJobs: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.findCondition(req.query));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Get list job',
            security: true,
            responses: {
                200: 'Found data'
            }
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: title|asc )',
                    pattern: RE.checkSortArrayString.source
                },
                page: {
                    type: DataType.String,
                    description: 'Page number of result',
                    pattern: RE.checkNumberString.source
                },
                limit: {
                    type: DataType.String,
                    description: 'Limit per page',
                    pattern: RE.checkNumberString.source
                },
                term: {
                    type: DataType.String,
                    description: 'Term that will be searched on all fields',
                    pattern: RE.checkString.source
                },
                value: {
                    type: DataType.String,
                    description: 'List of exact match value. (example: tile|abc,description|adc )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: field1,field2)',
                    pattern: RE.checkFields.source
                },
                status: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: 1,2)',
                    pattern: RE.checkFields.source
                },
                embedded: {
                    type: DataType.String,
                    description: 'example: kol_group,manager_by,assign_brand,groups_reference,kol_jobs,invites',
                    pattern: RE.checkFields.source
                }
            }
        }
    };

    public readonly getJob: IHandler = {
        method: async (req: Request, res: Response) => {
            const job  = await this._jobService.findById(req.params.id, req.query.embedded);
            if (!job) throw new NotFound('JOB_NOT_FOUND');
            return res.json(await this._jobService.getStatisticInfoJob(job));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Get job',
            security: true,
            responses: {
                200: 'Found job'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            query: {
                embedded: {
                    type: DataType.String,
                    description: 'example: kol_group,manager_by,assign_brand,groups_reference,kol_jobs,invites',
                    pattern: RE.checkFields.source
                }
            }
        }
    };

    public readonly getAttachment: IHandler = {
        method: async (req: Request, res: Response) => {
            const data = await this._jobService.getAttachment(req.params.id, req.params.name);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Get attachment',
            security: true,
            responses: {
                200: 'Found attachment'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                name: {
                    type: DataType.String
                }
            }
        }
    };

    public readonly getKols: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._jobService.getKols(req.params.id, req.query))
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Get List Kols',
            security: true,
            responses: {
                200: 'Found kols'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            query: {
                text: {
                    type: DataType.String
                },
                limit: {
                    type: DataType.Number,
                    default: 10
                },
                page: {
                    type: DataType.Number,
                    default: 0
                },
                post_time: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    description: 'ex: post_time=5ce26b6f836f171ffd8e31c4'
                },
                group: {
                    type: DataType.String,
                    description: 'ex: group=1'
                },
                status: {
                    type: DataType.String,
                    example: 'status=1,2',
                    description: '1: raw, 2: invite, 3: join'
                },
                kol_job_status: {
                    type: DataType.String,
                    example: 'status=1,2,3,4,5',
                },
                post_status: {
                    type: DataType.String,
                    example: 'status=1,2,3',
                },
                post_request: {
                    type: DataType.String,
                    example: 'post_request=0,1,-1',
                },
                kol_job_block: {
                    type: DataType.String,
                    enum: ['1', '0']
                }
            }
        }
    };
    /**/

    /* POST */
    public readonly createJob: IHandler = {
        method: async (req: Request, res: Response) => {
            var data: object = req.body;

            data['manager_by'] = req.auth.id;
            if (data['time']) {
                data['time'].forEach(time => {
                    time.time = new Date(time.time);
                });
            }
            return res.json(await this._jobService.createJob(<IJob>data));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Create job',
            security: true,
            responses: {
                200: 'Job was created'
            }
        },
        validation: {
            body: <IObjectOfArraySchema>{ type: DataType.Object, properties: CJobValidator }
        }
    };

    public readonly addGroup: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.addGroup(req.auth.id, req.params.id, req.body));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Add Groups',
            security: true,
            responses: {
                200: 'Group was added'
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
                properties: {
                    tag: {
                        type: DataType.Number,
                        enum: getOptionsTag(),
                        required: true
                    },
                    price: {
                        type: DataType.Number,
                        required: true
                    },
                    kols: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        }
                    }
                }
            }
        }
    };

    public readonly addKols: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.addKols(req.auth.id, req.params.id, req.body.groups));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Add Kol',
            security: true,
            responses: {
                200: 'Kols were added'
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
                properties: {
                    groups: {
                        type: DataType.Array,
                        items: {
                            type: DataType.Object,
                            properties: {
                                tag: {
                                    type: DataType.Number,
                                    enum: getOptionsTag()
                                },
                                kols: {
                                    type: DataType.Array,
                                    items: {
                                        type: DataType.String
                                    },
                                    required: true
                                }
                            }
                        },
                        required: true
                    }
                }
            }
        }
    };


    /**/

    /* PUT */
    public readonly updateJob: IHandler = {
        method: async (req: Request, res: Response) => {
            var data: object = req.body;
            if (data['time']) {
                data['time'].forEach(time => {
                    time.time = new Date(time.time);
                });
            }
            return res.json({
                success: await this._jobService.updateJob(req.params.id, data)
            });
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Update job',
            security: true,
            responses: {
                200: 'Job was updated'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            },
            body: <IObjectOfArraySchema>{ type: DataType.Object, properties: UJobValidator }
        }
    };

    public readonly actionCloseJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._jobService.closeJob(req.params.id, req.body.reason)
            });
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Close job',
            security: true,
            responses: {
                200: 'Job was closed'
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
                properties: {
                    reason: {
                        type: DataType.String
                    }
                }
            }
        }
    };

    public readonly updateGroup: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.updateGroup(req.params.id, req.params.tag, req.body));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Update group',
            security: true,
            responses: {
                200: 'Group was updated'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                tag: {
                    type: DataType.Number
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    price: {
                        type: DataType.Number
                    }
                }
            }
        }
    };

    public actionUpdateEngagement: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.updateEngagement(req.params.id));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Update engagement',
            security: true,
            responses: {
                200: 'Update engagement for job'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        }
    };

    public actionUpdatePostLink: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.updateAutoPostLink(req.body));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Update link for kol job',
            security: true,
            responses: {
                200: 'Job was updated'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    job_id: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        }
    };

    public actionGenerateJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                jobs: await this._jobService.generateJobs(req.body)
            });
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Fake job sample',
            security: true,
            responses: {
                200: 'Job was updated'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    email: {
                        type: DataType.String,
                        description: 'abc@gmail.com,xyz@gmail.com'
                    },
                    number: {
                        type: DataType.Number
                    },
                    is_send: {
                        type: DataType.Boolean,
                        default: false
                    }
                }
            }
        }
    };

    public actionAuthFinish: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.autoFinishJob());
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Finish job',
            security: true,
            responses: {
                200: 'Jobs were updated'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        }
    };
    /**/

    /* Delete */
    public readonly removeJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._jobService.removeJob(req.params.id)
            });
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Remove job',
            security: true,
            responses: {
                200: 'Job was removed'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        }
    };

    public readonly removeGroup: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.removeGroup(req.params.id, req.params.tag));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Remove group',
            security: true,
            responses: {
                200: 'Group was removed'
            }
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                tag: {
                    type: DataType.Number
                }
            }
        }
    };

    public readonly removeKols: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._jobService.removeKols(req.params.id, req.body.groups));
        },
        document: {
            tags: ['Admin Job Manager'],
            summary: 'Remove Kol',
            security: true,
            responses: {
                200: 'Kols were added'
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
                properties: {
                    groups: {
                        type: DataType.Array,
                        items: {
                            type: DataType.Object,
                            properties: {
                                tag: {
                                    type: DataType.Number,
                                    required: true
                                },
                                kols: {
                                    type: DataType.Array,
                                    items: {
                                        type: DataType.String
                                    },
                                    required: true
                                }
                            }
                        },
                        required: true
                    }
                }
            }
        }
    }
    /**/
}
