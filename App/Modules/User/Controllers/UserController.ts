import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface';
import { DataType, FormatType } from 'System/Enum';
import * as RE from 'System/RegularExpression';

import { UserService } from '../Services/UserService';
import { getAvatarUrlInfo } from 'App/Helpers/Format';
import { BadRequest } from 'System/Error';

@Injectable
export class UserController {
    constructor(private readonly _userServ: UserService) {}

    private avatarBasePath = '/user/users/';

    createUser: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            return res.status(201).json(await this._userServ.create(req.body, avatarUrlInfo));
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
                    roles: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        }
                    }
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Create new user',
            security: true,
            responses: {
                201: 'User was created',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    updateUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            return res.status(200).json(await this._userServ.updateUserById(req.params.id, req.body, avatarUrlInfo));
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
                    roles: {
                        type: DataType.Array,
                        items: {
                            type: DataType.String,
                            pattern: RE.checkMongoId.source
                        }
                    },
                    is_disabled: {
                        type: DataType.Boolean
                    }
                }
            }
        },
        document: {
            tags: ['User Management'],
            summary: 'Update user by specific Id',
            security: true,
            responses: {
                200: 'User was updated',
                400: 'Bad request',
                403: 'Failed authorization',
                500: 'Internal Error'
            }
        }
    };

    getUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            return res.status(200).json(await this._userServ.findById(req.params.id, req.query.fields, avatarUrlInfo));
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
            tags: ['User Management'],
            summary: 'Get a user by specified Id',
            security: true,
            responses: {
                200: 'Found User',
                404: 'Not Found User'
            }
        }
    };

    public readonly getUsers: IHandler = {
        method: async (req: Request, res: Response) => {
            let avatarUrlInfo = getAvatarUrlInfo(req, this.avatarBasePath);

            return res.status(200).json(await this._userServ.findUserWithFilter(req.query, avatarUrlInfo));
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
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: email,code )',
                    pattern: RE.checkFields.source
                }
            }
        },
        document: {
            tags: ['User Management'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get users by conditions'
        }
    };

    public readonly uploadAvatar: IHandler = {
        method: async (req: Request, res: Response) => {
            if (!req.files!.avatar) throw new BadRequest({ fields: { avatar: 'is required' } });

            return res.status(200).json(await this._userServ.uploadAvatar(req.params.id, req.files!.avatar));
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
            tags: ['User Management'],
            responses: {
                200: 'Image upload successfully',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Upload avatar'
        }
    };

    public readonly getAvatar: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).sendFile(await this._userServ.getAvatarAbsolutePath(req.params.id), {
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
            tags: ['User Management'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get avatar of user by specified ID'
        }
    };

    deleteUserById: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._userServ.deleteById(req.params.id));
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
            tags: ['User Management'],
            summary: 'Delete a user by specified Id',
            security: true
        }
    };
}
