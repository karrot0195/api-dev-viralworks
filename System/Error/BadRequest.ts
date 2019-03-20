import { BaseError } from '../Error';

export class BadRequest extends BaseError {
    constructor(message: string | object) {
        super(message, 400);
    }
}