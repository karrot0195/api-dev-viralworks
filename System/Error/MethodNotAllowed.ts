import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class MethodNotAllowed extends BaseError {
    constructor(message: string | object = CommonErrorMessage.E405) {
        super(message, 405);
    }
}