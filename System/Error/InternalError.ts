import { BaseError } from '../Error';

export class InternalError extends BaseError {
    constructor(message: string = 'INTERNAL_ERROR') {
        super(message, 500);
    }
}
