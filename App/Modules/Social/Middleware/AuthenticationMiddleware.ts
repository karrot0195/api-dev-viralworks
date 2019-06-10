import { Config } from 'System/Config';
import { Injectable } from 'System/Injectable';
import { Request, NextFunction } from 'express';
import { IMiddleware } from 'System/Interface';
import { Unauthorized } from 'System/Error';

@Injectable
export class AuthenticationMiddleware implements IMiddleware {
    constructor(readonly config: Config) {}

    public async handle(req: Request, next: NextFunction) {
        if (!req.auth.id) {
            return next(new Unauthorized('UNAUTHORIZED'));
        }
        return next();
    }
}