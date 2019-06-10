import { Unauthorized } from 'System/Error';
import * as JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// import * as bcrypt from 'bcrypt';

import { Injectable } from './Injectable';
import { Config } from './Config';

@Injectable
export class Security {
    constructor(private readonly _config: Config) {}

    public decodeToken(req: Request, res: Response, next: NextFunction) {
        req.auth = {};
        if (req.headers && req.headers.authorization) {
            try {
                const key = Buffer.from(this._config.jwt.key, 'base64');
                const token = req.headers.authorization;
                const decode = JWT.verify(token, key);

                if (decode) {
                    req.auth = decode;
                }
            } catch (e) {
                if (e instanceof JWT.TokenExpiredError) {
                    return next(new Unauthorized('UNAUTHORIZED_EXPIRED'));
                } else {
                    return next(new Unauthorized('UNAUTHORIZED'));
                }
            }
        }

        return next();
    }
}
