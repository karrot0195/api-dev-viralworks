import { BaseError } from '../Error';

export class Forbidden extends BaseError {
    constructor(message: string = "Don't have permission") {
        super(message, 403);
    }
}