import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { Request, Response, NextFunction } from 'express';
import { DataType } from 'System/Enum';
import * as _ from 'lodash';
import { CategoryReasonService } from '../Services/CategoryReasonService';
import { NotFound, Conflict, InternalError } from 'System/Error';
import * as RE from 'System/RegularExpression';

@Injectable
export class CategoryReasonController {
    constructor(private readonly _categoryReasonService: CategoryReasonService) {}

    createCategoryReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            try {
                return res.json(await this._categoryReasonService.createCategoryReason(req.body));
            } catch (err) {
                if (err.code == 11000) {
                    throw new Conflict('Duplicate category reason');
                }
                throw new InternalError(err.message);
            }
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        description: 'Category name'
                    }
                }
            }
        },
        document: {
            tags: ['Category Reason'],
            summary: 'Create new category reason',
            security: true,
            responses: {
                200: 'successfull'
            }
        }
    };

    deleteCategoryReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._categoryReasonService.removeCategoryReason(req.params.id));
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
            tags: ['Category Reason'],
            summary: 'Delete category reason',
            security: true,
            responses: {
                200: 'Category reason was deleted successfully'
            }
        }
    };

    getReasons: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._categoryReasonService.getReasons());
        },
        validation: {},
        document: {
            tags: ['Category Reason'],
            summary: 'Get list reason',
            security: true,
            responses: {
                200: 'successfull'
            }
        }
    };

    getReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const catReason = await this._categoryReasonService.findCategoryReasonById(req.params.id);
            if (catReason) {
                return res.json(catReason);
            }
            throw new NotFound();
        },
        validation: {},
        document: {
            tags: ['Category Reason'],
            summary: 'Get info category reason',
            security: true,
            responses: {
                200: 'successfull',
                404: 'Not found category reason'
            }
        }
    };

    updateCategoryReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const catReason = await this._categoryReasonService.findCategoryReasonById(req.params.id);
            if (catReason) {
                return res.json(await this._categoryReasonService.updateCategoryReason(catReason, req.body));
            }
            throw new NotFound();
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source,
                    description: 'Category reason id'
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        description: 'Category reason name'
                    }
                }
            }
        },
        document: {
            tags: ['Category Reason'],
            summary: 'Update data category reason',
            security: true,
            responses: {
                200: 'Category reason was updated successfully',
                404: 'Not found category reason'
            }
        }
    };

    createReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const catReason = await this._categoryReasonService.findCategoryReasonById(req.params.id);
            if (catReason) {
                return res.json(await this._categoryReasonService.createReason(catReason, req.body));
            }
            throw new NotFound();
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source,
                    description: 'Category reason id'
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        description: 'Reason name'
                    }
                }
            }
        },
        document: {
            tags: ['Category Reason'],
            summary: 'Update data category reason',
            security: true,
            responses: {
                200: 'Category reason was updated successfully',
                404: 'Not found category reason'
            }
        }
    };

    updateReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            const catReason = await this._categoryReasonService.findCategoryReasonById(req.params.id);
            const idx = this._categoryReasonService.getIndexReason(catReason, req.body.reason_id);
            if (idx > -1) {
                return res.json(await this._categoryReasonService.updateReason(catReason, idx, req.body));
            } else {
                throw new NotFound('Not found reason');
            }
            throw new NotFound('Not found category reason');
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source,
                    description: 'Category reason id'
                }
            },
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                        description: 'Reason name'
                    },
                    reason_id: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkMongoId.source,
                        description: 'Reason id'
                    }
                }
            }
        },
        document: {
            tags: ['Category Reason'],
            summary: 'Update data reason',
            security: true,
            responses: {
                200: 'Reason was updated successfully'
            }
        }
    };

    deleteReason: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.json(await this._categoryReasonService.deleteReason(req.params.id, req.params.reason_id));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source,
                    description: 'Category reason id'
                },
                reason_id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source,
                    description: 'Reason id'
                }
            }
        },
        document: {
            tags: ['Category Reason'],
            summary: 'Delete reason',
            security: true,
            responses: {
                200: 'Reason was deleted successfully'
            }
        }
    };
}
