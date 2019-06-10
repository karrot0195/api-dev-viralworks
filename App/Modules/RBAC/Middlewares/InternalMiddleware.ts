import { Config } from 'System/Config';
import { Injectable } from 'System/Injectable';
import { Request, NextFunction } from 'express';
import { IMiddleware } from 'System/Interface';
import { Forbidden } from 'System/Error';

@Injectable
export class InternalMiddleware implements IMiddleware {
    constructor(readonly config: Config) {}

    public async handle(req: Request, next: NextFunction) {
        console.log(`Calling internal API ${req.originalUrl} from IP ${req.ip}`);

        if (this.config.internal_ip.indexOf(req.ip) === -1) next(new Forbidden('INTERNAL_ACCESS'));

        return next();
    }
}
