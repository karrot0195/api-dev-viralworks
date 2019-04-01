import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class Unauthorized extends BaseError {
    constructor() {
        super(CommonErrorMessage.E401, 401);
    }
}