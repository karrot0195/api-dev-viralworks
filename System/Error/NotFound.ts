import { BaseError } from '../Error';

export class NotFound extends BaseError {
    constructor(message: string = 'NOT_FOUND') {
        super(message, 404);
    }
}