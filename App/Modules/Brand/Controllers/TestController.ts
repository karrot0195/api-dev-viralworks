import { Injectable } from 'System/Injectable';
import { Request, Response } from 'express';
import { Config } from 'System/Config';
import { IHandler } from 'System/Interface';
import { RoleBasedAccessControl as RBAC } from 'System/RBAC';

@Injectable
export class TestController {
    constructor(readonly config: Config, private readonly rbac: RBAC) { }

    public readonly getTest: IHandler = {
        method: (req: Request, res: Response) => {
            return res.json('Under construction');
        },
        document: {
            tags: ['Test'],
            responses: {
                200: 'Found Data',
                403: 'Forbidden',
                406: 'Not Acceptable',
                500: 'Internal Error'
            },
            security: true
        }
    };
}