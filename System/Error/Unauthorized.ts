import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class Unauthorized extends BaseError {
    constructor(message: string = CommonErrorMessage.E401) {
        super(message, 401);
    }
}