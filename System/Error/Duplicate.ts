import { BaseError } from '../Error';
import { CommonErrorMessage } from 'System/Enum/Error';

export class Duplicate extends BaseError {
    constructor() {
        super(CommonErrorMessage.E700, 700);
    }
}