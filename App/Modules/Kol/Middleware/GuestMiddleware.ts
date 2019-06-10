import { Injectable } from 'System/Injectable';
import { IMiddleware } from 'System/Interface/Middleware';
import { Config } from 'System/Config';
import { Request, NextFunction } from 'express';

@Injectable
export class GuestMiddleware implements IMiddleware {
constructor(readonly config: Config) {}

    public async handle(req: Request, next: NextFunction) {
    if (!req.auth.roles) req.auth.roles = [];

    req.auth.roles.push('guest');

    return next();
}
}
