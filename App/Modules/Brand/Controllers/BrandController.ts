import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { BrandService, ICustomPackageFilter } from '../../Brand/Services/BrandService';
import { IHandler } from 'System/Interface/Controller';
import { DataType, FormatType } from 'System/Enum';
import * as RE from 'System/RegularExpression';
import { getAvatarUrlInfo } from 'App/Helpers/Format';
import { BadRequest } from 'System/Error';

@Injectable
export class BrandController {
    constructor(private readonly _brandService: BrandService) {}

    private brandAvatarBasePath = '/brand/brands/';
    private jobCoverBasePath = '/job/jobs/';
    private packageCoverBasePath = '/package/packages/';

    getBrandById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.brandAvatarBasePath);

            return res
                .status(200)
                .json(await this._brandService.findById(req.params.id, req.query.fields, avatarUrlInfo));
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    pattern: RE.checkFields.source
                }
            },
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            summary: 'Get a brand by specified Id',
            security: true,
            responses: {
                200: 'Found Brand',
                404: 'Not Found Brand'
            }
        }
    };

    createBrand: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.brandAvatarBasePath);

            return res.status(201).json(await this._brandService.create(req.body, avatarUrlInfo));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkString.source
                    },
                    email: {
                        type: DataType.String,
                        required: true,
                        format: FormatType.Email
                    },
                    password: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkPassword.source
                    },
                    phone: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkVietnamPhoneNumberString.source
                    },
                    tmp_avatar: {
                        type: DataType.String
                    }
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            summary: 'Create new brand',
            security: true,
            responses: {
                201: 'Brand was created',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    getBrands: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.brandAvatarBasePath);

            return res.status(200).json(await this._brandService.findBrandWithFilter(req.query, avatarUrlInfo));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: email,phone )',
                    pattern: RE.checkFields.source
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get brands by conditions'
        }
    };

    updateBrandById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.brandAvatarBasePath);

            return res
                .status(200)
                .json(await this._brandService.updateBrandById(req.params.id, req.body, avatarUrlInfo));
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
                        type: DataType.String,
                        pattern: RE.checkString.source
                    },
                    email: {
                        type: DataType.String,
                        format: FormatType.Email
                    },
                    password: {
                        type: DataType.String,
                        pattern: RE.checkPassword.source
                    },
                    phone: {
                        type: DataType.String,
                        pattern: RE.checkVietnamPhoneNumberString.source
                    },
                    is_disabled: {
                        type: DataType.Boolean
                    }
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            summary: 'Update brand by specific Id',
            security: true,
            responses: {
                200: 'Brand was updated',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    public readonly uploadAvatar: IHandler = {
        method: async (req: Request, res: Response) => {
            if (!req.files!.avatar) throw new BadRequest({ fields: { avatar: 'is required' } });

            return res.status(200).json(await this._brandService.uploadAvatar(req.params.id, req.files!.avatar));
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
                avatar: {
                    type: DataType.File,
                    required: true
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            responses: {
                200: 'Image upload successfully',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Upload avatar'
        }
    };

    public readonly uploadTempAvatar: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._brandService.uploadTempAvatar(req.files!.avatar));
        },
        validation: {
            formData: {
                avatar: {
                    type: DataType.File,
                    required: true
                }
            }
        },
        document: {
            tags: ['Brand Management'],
            responses: {
                200: 'Image upload successfully',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Upload temporary avatar'
        }
    };

    public readonly getAvatar: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).sendFile(await this._brandService.getAvatarAbsolutePath(req.params.id), {
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
            tags: ['Brand Management'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get avatar of brand by specified ID'
        }
    };

    public readonly bookmarkPackage: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._brandService.bookmarkPackage(req.auth.id, req.body.package_id));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    package_id: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Bookmark a package for specified ID'
        }
    };

    public readonly removeBookmarkPackage: IHandler = {
        method: async (req: Request, res: Response) => {
            return res
                .status(200)
                .json(await this._brandService.removeBookmarkPackage(req.auth.id, req.body.package_id));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    package_id: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Remove a bookmark package for specified ID'
        }
    };

    public readonly findBookmarkPackage: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.packageCoverBasePath, '/cover');

            let customFilter: ICustomPackageFilter = {
                priceMin: +req.query.price_min || 0,
                priceMax: +req.query.price_max || 0
            };

            if (req.query.post_type !== undefined) customFilter.postType = +req.query.post_type;

            return res
                .status(200)
                .json(
                    await this._brandService.findBookmarkPackage(req.auth.id, req.query, customFilter, avatarUrlInfo)
                );
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                },
                price_min: {
                    type: DataType.String,
                    description: 'Min price of packages',
                    pattern: RE.checkNumberString.source
                },
                price_max: {
                    type: DataType.String,
                    description: 'Max price of packages',
                    pattern: RE.checkNumberString.source
                },
                post_type: {
                    type: DataType.String,
                    description: 'Post type of packages',
                    pattern: RE.checkNumberString.source
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get all bookmark packages of specified ID'
        }
    };

    public readonly getSidebarStats: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._brandService.getDashboardSidebarStats(req.auth.id));
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get sidebar stats of specified ID'
        }
    };

    public readonly getDashboardPackages: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.packageCoverBasePath, '/cover');

            let customFilter: ICustomPackageFilter = {
                priceMin: +req.query.price_min || 0,
                priceMax: +req.query.price_max || 0
            };

            if (req.query.post_type !== undefined) customFilter.postType = +req.query.post_type;

            return res
                .status(200)
                .json(
                    await this._brandService.getDashboardPackages(
                        req.auth.id,
                        req.query,
                        customFilter,
                        false,
                        undefined,
                        avatarUrlInfo
                    )
                );
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                },
                price_min: {
                    type: DataType.String,
                    description: 'Min price of packages',
                    pattern: RE.checkNumberString.source
                },
                price_max: {
                    type: DataType.String,
                    description: 'Max price of packages',
                    pattern: RE.checkNumberString.source
                },
                post_type: {
                    type: DataType.String,
                    description: 'Post type of packages',
                    pattern: RE.checkNumberString.source
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get dashboard packages'
        }
    };

    public readonly getInstantPackages: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.packageCoverBasePath, '/cover');

            let customFilter: ICustomPackageFilter = {
                priceMin: +req.query.price_min || 0,
                priceMax: +req.query.price_max || 0
            };

            if (req.query.post_type !== undefined) customFilter.postType = +req.query.post_type;

            return res
                .status(200)
                .json(
                    await this._brandService.getDashboardPackages(
                        req.auth.id,
                        req.query,
                        customFilter,
                        true,
                        undefined,
                        avatarUrlInfo
                    )
                );
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                },
                price_min: {
                    type: DataType.String,
                    description: 'Min price of packages',
                    pattern: RE.checkNumberString.source
                },
                price_max: {
                    type: DataType.String,
                    description: 'Max price of packages',
                    pattern: RE.checkNumberString.source
                },
                post_type: {
                    type: DataType.String,
                    description: 'Post type of packages',
                    pattern: RE.checkNumberString.source
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get instant packages'
        }
    };

    getDashboardPackageById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.packageCoverBasePath, '/cover');

            return res.status(200).json(await this._brandService.getDashboardPackageById(req.params.id, avatarUrlInfo));
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
            tags: ['Brand Dashboard'],
            summary: 'Get a dashboard package by specified Id',
            security: true
        }
    };

    public readonly getOngoingJobs: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.jobCoverBasePath, '/cover');

            return res.status(200).json(await this._brandService.getOngoingJobs(req.auth.id, req.query, avatarUrlInfo));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get all ongoing jobs'
        }
    };

    public readonly getCompletedJobs: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.jobCoverBasePath, '/cover');

            return res
                .status(200)
                .json(await this._brandService.getCompletedJobs(req.auth.id, req.query, avatarUrlInfo));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: phone|asc,email|desc )',
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
                    description: 'List of exact match value. (example: email|abc@abc.com,phone|0123456789 )',
                    pattern: RE.checkValueArrayString.source
                }
            }
        },
        document: {
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get all completed jobs'
        }
    };

    public readonly getJobById: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.jobCoverBasePath, '/cover');

            return res.status(200).json(await this._brandService.getJobById(req.auth.id, req.params.id, avatarUrlInfo));
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
            tags: ['Brand Dashboard'],
            security: true,
            summary: 'Get job by id'
        }
    };
}
