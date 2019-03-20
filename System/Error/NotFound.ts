import { BaseError } from '../Error';

export class NotFound extends BaseError {
    constructor(message: string = "Not Found") {
        super(message, 404);
    }
}