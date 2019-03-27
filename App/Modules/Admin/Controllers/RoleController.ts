import { Request, Response } from 'express';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { DataType, HTTP } from 'System/Enum';
import { IHandler } from 'System/Interface';
import { RoleBasedAccessControl as RBAC } from 'System/RBAC';
import { RoleBasedAccessControlService as RBACService } from 'System/RBAC/Service';
import * as RE from 'System/RegularExpression';
import { NotFound } from 'System/Error';

@Injectable
export class RoleController {
    constructor(readonly config: Config, private readonly rbac: RBAC, private readonly service: RBACService) { }

    public readonly getPaths: IHandler = {
        method: (req: Request, res: Response) => {
            return res.json(this.rbac.routePathsWithModule);
        },
        document: {
            tags: ['Role Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get all paths'
        }
    };

    public readonly getPermissions: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json(this.service.findPermissions());
        },
        document: {
            tags: ['Role Manager'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden'
            },
            security: true,
            summary: 'Get all access control entries'
        }
    };

    public readonly searchPermissions: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.json('Under construction');
        },
        document: {
            tags: ['Role Manager'],
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
            return res.json(await this.service.findRoles());
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
            return res.json(await this.service.findRoleById(req.params.id));
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
            return res.json(await this.service.updateRoleById(req.params.id, req.body));
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
                        required: true
                    },
                    description: {
                        type: DataType.String
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
            return res.json(await this.service.createRole(req.body));
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    name: {
                        type: DataType.String,
                        required: true,
                    },
                    description: {
                        type: DataType.String,
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
            tags: ['Role Manager'],
            responses: {
                200: 'Role was updated successfully',
                403: 'Forbidden',
                400: 'Bad Request',
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
    }

    private async setPermissionHandler(req: Request, res: Response) {
        return res.json(await this.service.setRolesForPermissionById(req.params.id, req.body));
    }
}