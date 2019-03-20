import { BaseError } from '../Error';

export class MethodNotAllowed extends BaseError {
    constructor(message: string | object = '') {
        super(message, 405);
    }
}