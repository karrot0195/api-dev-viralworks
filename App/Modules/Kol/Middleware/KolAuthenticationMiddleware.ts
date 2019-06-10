import { Config } from 'System/Config';
import { Injectable } from 'System/Injectable';
import { Request, NextFunction } from 'express';
import { IMiddleware } from 'System/Interface';
import { Unauthorized } from 'System/Error';
import { TYPE_AUTH } from 'App/Modules/Kol/Services/AuthService';

@Injectable
export class KolAuthenticationMiddleware implements IMiddleware {
    constructor(readonly config: Config) {}

    public async handle(req: Request, next: NextFunction) {
        if (!req.auth.id || req.auth['type'] != TYPE_AUTH) {
            return next(new Unauthorized());
        }
        return next();
    }
}
