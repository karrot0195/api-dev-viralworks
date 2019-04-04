import { Request, Response, NextFunction } from 'express';
import * as _ from 'lodash';
import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { KolAuthService } from '../Services/KolAuthService';
import { Conflict, InternalError } from 'System/Error';
import { KolInfoStatus } from 'App/Models/KolUserModel';

@Injectable
export class KolAuthController {
    constructor(private readonly _kolAuthService: KolAuthService) {}

    createKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            try {
                return res.json(await this._kolAuthService.create(req.body));
            } catch (err) {
                if (err.code == 11000) {
                    throw new Conflict('Duplicate Email');
                } else {
                    throw new InternalError(err);
                }
            }
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
            tags: ['kol authenticate'],
            summary: 'create new kol user',
            security: true,
            responses: {
                200: 'Kol user was created successfully'
            }
        }
    };

    removeKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            if (process.env.ENV == 'production') {
                throw new InternalError('Feature not enable in "production" env');
            }

           return res.json(await this._kolAuthService.removeKoluser(req.params.id));
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
            tags: ['kol authenticate'],
            summary: 'Delete kol user',
            security: true,
            responses: {
                200: 'Kol user was deleted successfully'
            }
        }
    };

    getKolUsers: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.findCondition(req.query));
        },
        document: {
            tags: ['kol authenticate'],
            summary: 'get list kol register by condition',
            security: true,
            responses: {
                200: 'Found data'
            }
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: field1|asc,field2|desc )',
                    pattern: RE.checkSortArrayString.source
                },
                page: {
                    type: DataType.Number,
                    description: 'Page number of result',
                    default: 0
                },
                limit: {
                    type: DataType.Number,
                    description: 'Limit per page',
                    default: 0
                },
                term: {
                    type: DataType.String,
                    description: 'Term that will be searched on all fields',
                    pattern: RE.checkString.source
                },
                value: {
                    type: DataType.String,
                    description: 'List of exact match value. (example: field1|value1,field|value2 )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: field1,field2 )',
                    pattern: RE.checkFields.source
                }
            }
        }
    };

    getKolUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const embedded = _.get(req.query, 'fields', '');
            var fields: Array<string> = [];
            if (embedded) {
                fields = embedded.trim().split(',');
            }
            return res.json(await this._kolAuthService.findById(req.params.id).select(fields));
        },
        document: {
            tags: ['kol authenticate'],
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

    updateKolInfoBase: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                try {
                    return res.json(await this._kolAuthService.updateBasicInfo(kolUser, req.body));
                } catch (err) {
                    throw new InternalError(err);
                }
            }
            throw new NotFound('Not Found');
        },
        document: {
            tags: ['kol authenticate'],
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
                properties: {
                    mobile: {
                        type: DataType.String
                    },
                    sex: {
                        type: DataType.Number,
                        enum: [-1, 0, 1]
                    },
                    dob: {
                        type: DataType.Number
                    },
                    matrimony: {
                        type: DataType.Number,
                        enum: [-1, 0, 1]
                    },
                    num_child: {
                        type: DataType.Number,
                        minimum: 0
                    },
                    job: {
                        type: DataType.Array,
                        uniqueItems: true,
                        items: {
                            type: DataType.Number,
                            pattern: RE.checkMongoId.source
                        }
                    },
                    job_other: {
                        type: DataType.Array,
                        uniqueItems: true,
                        items: {
                            type: DataType.Number,
                            pattern: RE.checkMongoId.source
                        }
                    },
                    share_story: {
                        type: DataType.Array,
                        uniqueItems: true,
                        items: {
                            type: DataType.Number,
                            pattern: RE.checkMongoId.source
                        }
                    },
                    share_story_other: {
                        type: DataType.Array,
                        uniqueItems: true,
                        items: {
                            type: DataType.Number,
                            pattern: RE.checkMongoId.source
                        }
                    },
                    price: {
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
                }
            }
        }
    };

    updateKolInfoFacebook: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                try {
                    return res.json(await this._kolAuthService.updateFacebookInfo(kolUser, req.body));
                } catch (err) {
                    throw new InternalError(err);
                }
            }
            throw new NotFound('Not Found');
        },
        document: {
            tags: ['kol authenticate'],
            summary: 'update info facebook',
            security: true,
            responses: {
                200: 'Kol user was updated successfully'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    entity_id: {
                        type: DataType.String
                    },
                    name: {
                        type: DataType.String
                    },
                    profile_link: {
                        type: DataType.String
                    },
                    app_scoped_id: {
                        type: DataType.String
                    },
                    app_scoped_token: {
                        type: DataType.String
                    },
                    page: {
                        type: DataType.Array,
                        items: {
                            type: DataType.Object,
                            properties: {
                                access_token: {
                                    type: DataType.String
                                },
                                category: {
                                    type: DataType.String
                                },
                                name: {
                                    type: DataType.String
                                },
                                id: {
                                    type: DataType.String
                                }
                            }
                        }
                    },
                    analytic: {
                        type: DataType.Object,
                        properties: {
                            total_follower: {
                                type: DataType.Number
                            },
                            total_post_last_3_month: {
                                type: DataType.Number
                            },
                            avg_reaction_last_3_month: {
                                type: DataType.Number
                            },
                            avg_comment_last_3_month: {
                                type: DataType.Number
                            },
                            avg_sharing_last_3_month: {
                                type: DataType.Number
                            },
                            avg_engagement_last_3_month: {
                                type: DataType.Number
                            }
                        }
                    }
                }
            }
        }
    };

    getOptionEvaluate: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const embedded = _.get(req.query, 'fields', '');
            var fields: Array<string> = [];
            if (embedded) {
                fields = embedded.trim().split(',');
            }

            return res.json(this._kolAuthService.getEvaluateOption(fields));
        },
        document: {
            tags: ['kol authenticate'],
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

    updateKolInfoEvaluate: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                try {
                    return res.json(await this._kolAuthService.updateEvaluateInfo(kolUser, req.body));
                } catch (err) {
                    throw new InternalError(err);
                }
            }
            throw new NotFound('Not Found');
        },
        document: {
            tags: ['kol authenticate'],
            summary: 'update evaluate info',
            security: true,
            responses: {
                200: 'Kol evaluate info was updated successfully'
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    fb: {
                        type: DataType.Object,
                        properties: {
                            frequency: {
                                type: DataType.Number
                            },
                            style: {
                                type: DataType.Number
                            },
                            content: {
                                type: DataType.Array,
                                items: {
                                    type: DataType.Number
                                }
                            }
                        }
                    },
                    text: {
                        type: DataType.Object,
                        properties: {
                            length: {
                                type: DataType.Number
                            },
                            interactivity: {
                                type: DataType.Number
                            },
                            swearing_happy: {
                                type: DataType.Number
                            }
                        }
                    },
                    image: {
                        type: DataType.Object,
                        properties: {
                            content: {
                                type: DataType.Array,
                                items: {
                                    type: DataType.Number
                                }
                            },
                            personal_style: {
                                type: DataType.Array,
                                items: {
                                    type: DataType.Number
                                }
                            },
                            scenery: {
                                type: DataType.Number
                            },
                            refine_content: {
                                type: DataType.Number
                            }
                        }
                    },
                    general_style: {
                        type: DataType.Object,
                        properties: {
                            appearence: {
                                type: DataType.Number
                            },
                            brand: {
                                type: DataType.Number
                            }
                        }
                    }
                }
            }
        }
    };

    updateKolInfoStatus: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                const status = req.body.status;
                var result: Object = {};
                if (status === KolInfoStatus.Verified) {
                    result = await this._kolAuthService.verifyKolInfo(kolUser, req.auth.id);
                } else if (status === KolInfoStatus.Rejected) {
                    result = await this._kolAuthService.rejectKolInfo(kolUser, req.auth.id, req.body.reason);
                }
                return res.json(result);
            }
            throw new NotFound('Not found kol user');
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
                    status: {
                        type: DataType.Number,
                        required: true,
                        enum: [KolInfoStatus.Verified, KolInfoStatus.Rejected]
                    },
                    reason: {
                        type: DataType.Object,
                        properties: {
                            reason_id: {
                                type: DataType.Number
                            },
                            description: {
                                type: DataType.String
                            }
                        }
                    }
                }
            }
        },
        document: {
            tags: ['kol authenticate'],
            security: true,
            summary: 'update kol info status',
            responses: {
                200: 'Kol info status was updated successfully'
            }
        }
    };
}
