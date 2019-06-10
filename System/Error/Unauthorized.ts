import { BaseError } from '../Error';

export class Unauthorized extends BaseError {
    constructor(message: string = 'UNAUTHORIZED') {
        super(message, 401);
    }
}
