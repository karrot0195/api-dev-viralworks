import { Request, NextFunction } from 'express';

export interface IMiddleware {
    handle(req: Request, next: NextFunction, params?: { [name: string]: string | object | number | boolean });
}