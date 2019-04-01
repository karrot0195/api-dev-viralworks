import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class NotFound extends BaseError {
    constructor(message: string = CommonErrorMessage.E404) {
        super(message, 404);
    }
}