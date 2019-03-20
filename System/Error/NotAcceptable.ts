import { BaseError } from '../Error';

export class NotAcceptable extends BaseError {
    constructor(message: string | object) {
        super(message, 406);
    }
}