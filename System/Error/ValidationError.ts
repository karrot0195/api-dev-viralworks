import { BaseError } from '../Error';

export namespace ValidationError {

	export interface ErrorDict {
		readonly [field: string]: string;
	}

}

export class ValidationError extends BaseError {
	constructor(
		public readonly errors: ValidationError.ErrorDict, status: number = 406
	) {
		super(errors, status);
	}
}
