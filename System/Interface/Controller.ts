import { Request } from 'express';
import { ISwaggerDocument, IValidation } from './Swagger';

export interface IHandler {
    readonly method: Function;
    readonly validation?: IValidation;
    readonly document?: ISwaggerDocument;
    policy?(request: Request): boolean | Promise<boolean>;
}