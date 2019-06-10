import { BaseError } from '../Error';

export class Forbidden extends BaseError {
    constructor(message: string = 'FORBIDDEN') {
        super(message, 403);
    }
}
