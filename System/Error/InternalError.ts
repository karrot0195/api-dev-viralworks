import { BaseError } from '../Error';

export class InternalError extends BaseError {
    constructor(message: string | object) {
        super(message, 500);
    }
}