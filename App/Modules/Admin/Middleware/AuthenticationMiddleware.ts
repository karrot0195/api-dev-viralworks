import { Config } from 'System/Config';
import { Injectable } from 'System/Injectable';
import { Request, NextFunction } from 'express';
import { IMiddleware } from 'System/Interface';
import { Forbidden } from 'System/Error';

@Injectable
export class AuthenticationMiddleware implements IMiddleware {
    constructor(readonly config: Config) {}

    public async handle(req: Request, next: NextFunction) {
        if (!req.auth || !req.auth.id) {
            return next(new Forbidden("You must login before using this feature"));
        }
        return next();
    }
}