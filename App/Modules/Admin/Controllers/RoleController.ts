import { Request, Response } from 'express';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { DataType, HTTP } from 'System/Enum';
import { IHandler } from 'System/Interface';
import { RoleBasedAccessControl as RBAC } from 'System/RBAC';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';
import * as RE from 'System/RegularExpression';

@Injectable
export class RoleController {
    constructor(readonly config: Config, private readonly rbac: RBAC, private readonly service: RBACService) {}

    public readonly getPaths: IHandler = {
        method: (req: Request, res: Response) => {
            return res.status(200).json(this.service.routePathsWithModule);
        },
        document: {
            tags: ['Entry Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get all paths'
        }
    };

    public readonly createPermission: IHandler = {
        method: async (req: Request, res: Response) => {
            let permission = await this.service.createPermission(req.body);
            if (permission) await this.rbac.load();
            return res.status(201).json(permission);
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    route: {
                        type: DataType.Object,
                        required: true,
                        properties: {
                            path: {
                                type: DataType.String,
                                required: true
                            },
                            method: {
                                type: DataType.String,
                                required: true,
                                pattern: RE.checkMethod.source
                            }
                        }
                    },
                    description: {
                        type: DataType.String,
                        required: true,
                        pattern: RE.checkString.source
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
            tags: ['Entry Manager'],
            responses: {
                201: 'Entry was created successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Create a new entry'
        }
    };

    public readonly updatePermission: IHandler = {
        method: async (req: Request, res: Response) => {
            let permission = await this.service.updatePermissionById(req.params.id, req.body);
            if (permission) await this.rbac.load();
            return res.status(200).json(permission);
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
                    description: {
                        type: DataType.String,
                        pattern: RE.checkString.source
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
            tags: ['Entry Manager'],
            responses: {
                200: 'Entry was updated successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Update a entry by specified ID'
        }
    };

    public readonly getPermissions: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findPermissionWithFilter(req.query));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: roles|asc,route|desc )',
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
                    description: 'List of exact match value. (example: roles|user,route.path|/test )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: roles,route.path )',
                    pattern: RE.checkFields.source
                }
            }
        },
        document: {
            tags: ['Entry Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get access control entries by conditions'
        }
    };

    public readonly getPermissionById: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findPermissionById(req.params.id, req.query.fields));
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: roles,route.path )',
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
            tags: ['Entry Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get access control entries by id'
        }
    };

    public readonly searchPermissions: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json('Under construction');
        },
        document: {
            tags: ['Entry Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Search access control entries'
        }
    };

    public readonly getRoles: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findRolesWithFilter(req.query));
        },
        validation: {
            query: {
                sort: {
                    type: DataType.String,
                    description: 'List of fields that wil be sorted. (example: roles|asc,parentId|desc )',
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
                    description: 'List of exact match value. (example: name|user,description|test )',
                    pattern: RE.checkValueArrayString.source
                },
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: name,description )',
                    pattern: RE.checkFields.source
                }
            }
        },
        document: {
            tags: ['Role Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get all roles'
        }
    };

    public readonly getRoleById: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findRoleById(req.params.id, req.query.fields));
        },
        validation: {
            query: {
                fields: {
                    type: DataType.String,
                    description: 'List of fields that will be returned. (example: name,description )',
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
            tags: ['Role Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden',
                404: 'This role is not exist'
            },
            security: true,
            summary: 'Get a role by specified ID'
        }
    };

    public readonly updateRole: IHandler = {
        method: async (req: Request, res: Response) => {
            let role = await this.service.updateRoleById(req.params.id, req.body);
            if (role) await this.rbac.load();
            return res.status(200).json(role);
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
                        required: true,
                        pattern: RE.checkString.source
                    },
                    description: {
                        type: DataType.String,
                        pattern: RE.checkString.source
                    },
                    parentId: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        },
        document: {
            tags: ['Role Manager'],
            responses: {
                200: 'Role was updated successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Update a role by specified ID'
        }
    };

    public readonly createRole: IHandler = {
        method: async (req: Request, res: Response) => {
            let role = await this.service.createRole(req.body);

            if (role) await this.rbac.load();

            return res.status(201).json(role);
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
                    description: {
                        type: DataType.String,
                        pattern: RE.checkString.source
                    },
                    parentId: {
                        type: DataType.String,
                        pattern: RE.checkMongoId.source
                    }
                }
            }
        },
        document: {
            tags: ['Role Manager'],
            responses: {
                201: 'Role was created successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Create a new role'
        }
    };

    public readonly setEntries: IHandler = {
        method: this.setPermissionHandler.bind(this),
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkMongoId.source
                }
            },
            body: {
                type: DataType.Array,
                uniqueItems: true,
                items: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Entry Manager'],
            responses: {
                200: 'Role was updated successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            },
            security: true,
            summary: 'Set permission for a role by specified ID'
        }
    };

    public readonly deleteRoleById: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(await this.service.deleteRoleById(req.params.id));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source,
                    required: true
                }
            }
        },
        document: {
            tags: ['Role Manager'],
            summary: 'Delete a role by specified ID',
            security: true,
            responses: {
                200: 'Role was deleted successfully',
                403: 'Forbidden',
                400: 'Bad Request'
            }
        }
    };

    private async setPermissionHandler(req: Request, res: Response) {
        return res.json(await this.service.setRolesForPermissionById(req.params.id, req.body));
    }
}
