declare module 'is-my-json-valid' {
	interface OptionDict {
		greedy?: boolean;
	}

	interface ValidationError {
		field: string;
		message: string;
	}

	interface ValidateFunc {
		(data: any): boolean;
		errors: ValidationError[];
	}

	function Validator(schema: string | Object, options?: OptionDict): ValidateFunc;

	namespace Validator {
		type Func = ValidateFunc;
		type Error = ValidationError;
	}

	export = Validator;
}
