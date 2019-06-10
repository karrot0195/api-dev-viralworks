import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType } from 'System/Enum';
import * as RE from 'System/RegularExpression';
import { Request, Response } from 'express';
import { KolJobService } from '../Services/KolJobService';

@Injectable
export class KolJobController {
    constructor(private _kolJobSerivce: KolJobService) {}

    getKolJobs: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._kolJobSerivce.findKolJobByCondition(req.query));
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
                type: {
                    type: DataType.String,
                    enum: [
                        'running',
                        'completed'
                    ]
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Get list kol job',
            security: true,
            responses: {
                200: 'Found data'
            }
        }
    };

    getKolJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._kolJobSerivce.findById(req.params.id));
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
            tags: ['Admin Kol Job Manager'],
            summary: 'Get kol job',
            security: true,
            responses: {
                200: 'Found job'
            }
        }
    };
    /* POST */
    createKolJobByInvite: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._kolJobSerivce.createKolJobByInviteId(req.body.invite_id, req.body.time_id));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    invite_id: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source,
                        required: true
                    },
                    time_id: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Create kol job',
            security: true,
            responses: {
                200: 'Created'
            }
        }
    };

    public actionPushNote: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._kolJobSerivce.pushNote(req.params.id, req.auth.id, req.body.note ));
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
                   note: {
                       type: DataType.String,
                       required: true
                   }
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Create note kol job',
            security: true,
            responses: {
                200: 'Created'
            }
        }
    };

    /* PUT */
    updatePostData: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this._kolJobSerivce.updatePostData(req.params.id, req.body));
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
                    content: {
                        type: DataType.String
                    },
                    link: {
                        type: DataType.String,
                        pattern: /^(http:\/\/(.*)|https:\/\/(.*))$/i.source
                    },
                    id: {
                        type: DataType.String
                    }
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Update data post',
            security: true,
            responses: {
                200: 'Data post was updated'
            }
        }
    };

    updateStatePostData: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._kolJobSerivce.updateStatePost(
                    req.auth.id,
                    req.params.id,
                    req.params.action,
                    req.body
                )
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                action: {
                    type: DataType.String,
                    enum: ['accept', 'reject']
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
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Update state post',
            security: true,
            responses: {
                200: 'Status post was updated'
            }
        }
    };

    closeJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._kolJobSerivce.closeJob(req.auth.id, req.params.id, req.body)
            });
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
                    rating: {
                        type: DataType.Number,
                        minimum: 0,
                        maximum: 5,
                        required: true
                    },
                    comment: {
                        type: DataType.String,
                    },
                    cheat: {
                        type: DataType.Boolean,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Close job',
            security: true,
            responses: {
                200: 'Job is closed'
            }
        }
    };

    public actionBlockJob: IHandler = {
        method: async (req: Request, res: Response) => {
            let state = false;
            if (req.params.action == 'block') {
                state = true;
            }
            return res.json({
                success: await this._kolJobSerivce.updateStateBlockJob(req.auth.id, req.params.id, state)
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                action: {
                    type: DataType.String,
                    enum: ['block', 'unblock']
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'block job',
            security: true,
            responses: {
                200: 'Job was blocked'
            }
        }
    };

    public actionChangePostTime: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._kolJobSerivce.changePostTime(req.auth.id, req.params.id, req.params.post_time)
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                post_time: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Change Post Time',
            security: true,
            responses: {
                200: 'changed'
            }
        }
    };

    updateStatePayment: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._kolJobSerivce.updateStatePayment(
                    req.auth.id,
                    req.params.id,
                    req.params.action,
                    req.body
                )
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                },
                action: {
                    type: DataType.String,
                    enum: ['accept', 'reject']
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
        },
        document: {
            tags: ['Admin Kol Job Manager'],
            summary: 'Update state payment',
            security: true,
            responses: {
                200: 'Payment was updated'
            }
        }
    };

    /**/

    /* DELETE */
    public removeKolJob: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json({
                success: await this._kolJobSerivce.removeKolJob(req.params.id)
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
            tags: ['Admin Kol Job Manager'],
            summary: 'Remove kol job',
            security: true,
            responses: {
                200: 'Kol job was deleted'
            }
        }
    };
    /**/
}
