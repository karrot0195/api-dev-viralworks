import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import { NotFound } from 'System/Error';
import * as RE from 'System/RegularExpression';

import { KolAuthService } from '../Services/KolAuthService';
import { Conflict, InternalError } from 'System/Error';
import { async } from 'rxjs/internal/scheduler/async';
import { json } from 'body-parser';

@Injectable
export class KolAuthController {
    constructor(private readonly _kolAuthService: KolAuthService) { }

    createKolUser: IHandler = {
        method: async(req: Request, res: Response, next: NextFunction) => {
            try {
                return res.json(await this._kolAuthService.create(req.body));
            } catch( err) {
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
            responses: {
                200: 'Kol user was created successfully'
            }
        }
    }

    getKolUsers: IHandler = {
        method: async(req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.findAll(req.query));
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
                page: {
                    type: DataType.String,
                    description: 'page of faq list'
                },
                limit: {
                    type: DataType.String,
                    description: 'number of returned faqs'
                },
                embedded: {
                    type: DataType.String,
                    description: 'fields result'
                }
            }
        }
    }

    getKolUser: IHandler = {
        method: async(req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._kolAuthService.findById(req.params.id, req.query.embedded));
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
                embedded: {
                    type: DataType.String,
                    description: 'fields result'
                }
            }
        },
    }

    updateKolInfoBase: IHandler = {
        method: async(req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                try {
                    return res.json(await this._kolAuthService.updateBasicInfo(kolUser, req.body));
                } catch(err) {
                    throw new InternalError(err);
                }
            }
            throw new NotFound('Not Found');
        },
        document: {
            tags: ['kol authenticate'],
            summary: 'update base info for kol user',
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
    }

    updateKolInfoFacebook: IHandler = {
        method: async(req: Request, res: Response, next: NextFunction) => {
            const kolUser = await this._kolAuthService.findById(req.params.id);
            if (kolUser) {
                try {
                    return res.json(await this._kolAuthService.updateFacebookInfo(kolUser, req.body));
                } catch(err) {
                    throw new InternalError(err);
                }
            }
            throw new NotFound('Not Found');
        },
        document: {
            tags: ['kol authenticate'],
            summary: 'update info facebook for kol user',
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
    }
}