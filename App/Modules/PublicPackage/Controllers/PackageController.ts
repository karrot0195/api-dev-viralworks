import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import * as RE from 'System/RegularExpression';

import { PackageService } from '../Services/PackageService';
import { getAvatarUrlInfo } from 'App/Helpers/Format';
import { BadRequest } from 'System/Error/BadRequest';

@Injectable
export class PackageController {
    constructor(private readonly _pkgService: PackageService) {}

    private coverBasePath = '/package/packages/';
    private publicCoverBasePath = '/package/public-packages/';
    private coverPath = '/cover';

    createPackage: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let coverUrlInfo = getAvatarUrlInfo(req, this.coverBasePath, this.coverPath);

            return res.status(201).json(await this._pkgService.create(req.body, coverUrlInfo));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true
                    },
                    description: {
                        type: DataType.String,
                        required: true
                    },
                    package_price: {
                        type: DataType.Number,
                        required: true
                    },
                    post_type: {
                        type: DataType.Number,
                        required: true
                    },
                    occupations: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        },
                        minItems: 1,
                        required: true
                    },
                    topics: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        },
                        minItems: 1,
                        required: true
                    },
                    male_percent: {
                        type: DataType.String,
                        required: true
                    },
                    location: {
                        type: DataType.String,
                        required: true
                    },
                    age_average: {
                        type: DataType.String,
                        required: true
                    },
                    tmp_cover: {
                        type: DataType.String
                    },
                    is_public: {
                        type: DataType.Boolean,
                        required: true
                    },
                    show_dashboard: {
                        type: DataType.Boolean,
                        required: true
                    },
                    is_instant: {
                        type: DataType.Boolean,
                        required: true
                    },
                    display_stats: {
                        type: DataType.Object,
                        properties: {
                            total_post: {
                                type: DataType.Number,
                                required: true
                            },
                            total_follower: {
                                type: DataType.Number,
                                required: true
                            },
                            total_average_engagement: {
                                type: DataType.Number,
                                required: true
                            },
                            location: {
                                type: DataType.String,
                                required: true
                            }
                        },
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Create new package',
            security: true
        }
    };

    createGroup: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(201).json(await this._pkgService.createGroup(req.params.id, req.body));
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
                    price: {
                        type: DataType.Number,
                        required: true
                    },
                    tag: {
                        type: DataType.Number,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Create new group for package specified Id',
            security: true
        }
    };

    updateGroupInfo: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res
                .status(200)
                .json(await this._pkgService.updateGroupInfo(req.params.id, +req.params.tag, req.body));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                },
                tag: {
                    type: DataType.Number,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    price: {
                        type: DataType.Number
                    },
                    tag: {
                        type: DataType.Number
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Update group for package specified Id',
            security: true
        }
    };

    updatePackageById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let coverUrlInfo = getAvatarUrlInfo(req, this.coverBasePath, this.coverPath);

            return res
                .status(200)
                .json(await this._pkgService.updatePackageById(req.params.id, req.body, coverUrlInfo));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String
                    },
                    description: {
                        type: DataType.String
                    },
                    package_price: {
                        type: DataType.Number
                    },
                    post_type: {
                        type: DataType.Number
                    },
                    occupations: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        },
                        minItems: 1
                    },
                    topics: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        },
                        minItems: 1
                    },
                    male_percent: {
                        type: DataType.String
                    },
                    location: {
                        type: DataType.String
                    },
                    age_average: {
                        type: DataType.String
                    },
                    is_public: {
                        type: DataType.Boolean
                    },
                    show_dashboard: {
                        type: DataType.Boolean
                    },
                    is_instant: {
                        type: DataType.Boolean
                    },
                    slug: {
                        type: DataType.String
                    },
                    display_stats: {
                        type: DataType.Object,
                        properties: {
                            total_post: {
                                type: DataType.Number,
                                required: true
                            },
                            total_follower: {
                                type: DataType.Number,
                                required: true
                            },
                            total_average_engagement: {
                                type: DataType.Number,
                                required: true
                            },
                            location: {
                                type: DataType.String,
                                required: true
                            }
                        }
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Update package by specificied Id',
            security: true
        }
    };

    public readonly uploadCover: IHandler = {
        method: async (req: Request, res: Response) => {
            if (!req.files!.cover) throw new BadRequest({ fields: { cover: 'is required' } });

            return res.status(200).json(await this._pkgService.uploadCover(req.params.id, req.files!.cover));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            },
            formData: {
                cover: {
                    type: DataType.File,
                    required: true
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            security: true,
            summary: 'Upload Package Cover'
        }
    };

    public readonly uploadTempCover: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._pkgService.uploadTempCover(req.files!.cover));
        },
        validation: {
            formData: {
                cover: {
                    type: DataType.File,
                    required: true
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            security: true,
            summary: 'Upload temporary package cover'
        }
    };

    public readonly getPublicCover: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).sendFile(await this._pkgService.getCoverAbsolutePath(req.params.id, true), {
                headers: { 'Content-Type': 'image/png' }
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Landing page KOL Package Management'],
            summary: 'Get cover of public package by specified ID'
        }
    };

    public readonly getPrivateCover: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).sendFile(await this._pkgService.getCoverAbsolutePath(req.params.id), {
                headers: { 'Content-Type': 'image/png' }
            });
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Get cover of private package by specified ID',
            security: true
        }
    };

    getPackageById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.coverBasePath, this.coverPath);

            return res.status(200).json(await this._pkgService.findById(req.params.id, avatarUrlInfo));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Get a package by specified Id',
            security: true
        }
    };

    getGroupsOfPackageById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._pkgService.getGroupsByPackageId(req.params.id));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Get groups of package by specified Id',
            security: true
        }
    };

    deletePackageById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._pkgService.deletePackageById(req.params.id));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Delete a package by specified Id',
            security: true
        }
    };

    deleteGroupByTag: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._pkgService.deleteGroupByTag(req.params.id, +req.params.tag));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                },
                tag: {
                    type: DataType.Number,
                    required: true
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Delete a group by specified tag and package Id',
            security: true
        }
    };

    insertKolsIntoGroupByTag: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res
                .status(200)
                .json(
                    await this._pkgService.insertKolsIntoGroupByTag(req.params.id, +req.params.tag, req.body.kol_list)
                );
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                },
                tag: {
                    type: DataType.Number,
                    required: true
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    kol_list: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        },
                        minItems: 1,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Insert kols into group by tag and package Id',
            security: true
        }
    };

    deleteKolFromPackage: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res
                .status(200)
                .json(await this._pkgService.deleteKolsFromPackage(req.params.id, req.body.delete_list));
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
                    delete_list: {
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
                                        type: DataType.String,
                                        pattern: RE.checkMongoId.source
                                    },
                                    minItems: 1,
                                    required: true
                                }
                            }
                        },
                        minItems: 1,
                        required: true
                    }
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            summary: 'Delete kols from package by specified Id',
            security: true
        }
    };

    public getPackages: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.coverBasePath, this.coverPath);

            return res.status(200).json(await this._pkgService.findPackageWithFilter(req.query, avatarUrlInfo));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: role|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,code|SU-152 )',
                    pattern: RE.checkValueArrayString.source
                }
            }
        },
        document: {
            tags: ['KOL Package Management'],
            security: true,
            summary: 'Get packages by conditions'
        }
    };

    public getPublicPackages: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.publicCoverBasePath, this.coverPath);

            req.query = {
                value: 'is_public|true'
            };

            return res.status(200).json(await this._pkgService.findPackageWithFilter(req.query, avatarUrlInfo));
        },
        document: {
            tags: ['Landing page KOL Package Management'],
            summary: 'Get all landing page packages'
        }
    };

    public getPublicPackagesBySlug: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.publicCoverBasePath, this.coverPath);

            return res.status(200).json(await this._pkgService.findBySlug(req.params.slug, avatarUrlInfo));
        },
        validation: {
            path: {
                slug: {
                    type: DataType.String,
                    required: true
                }
            }
        },
        document: {
            tags: ['Landing page KOL Package Management'],
            summary: 'Get all landing page packages'
        }
    };
}
