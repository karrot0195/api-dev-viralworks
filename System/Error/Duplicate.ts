import { BaseError } from '../Error';

export class Duplicate extends BaseError {
    constructor() {
        super('Some keys are duplicated', 700);
    }
}