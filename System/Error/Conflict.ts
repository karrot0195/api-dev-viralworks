import { BaseError } from '../Error';

export class Conflict extends BaseError {
    constructor(message: string | object) {
        super(message, 409);
    }
}