import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class Forbidden extends BaseError {
    constructor(message: string = CommonErrorMessage.E403) {
        super(message, 403);
    }
}