export abstract class BaseError extends Error {
	constructor(readonly message: any, readonly status: number = 500) {
		super(message);
		if (status) this.status = status;
	}

	get name() {
		return this.constructor.name;
	}
}

export { NotFound } from './Error/NotFound'
export { Forbidden } from './Error/Forbidden'
export { Unauthorized } from './Error/Unauthorized'
export { NotAcceptable } from './Error/NotAcceptable';
export { SystemError } from './Error/SystemError';
export { BadRequest } from './Error/BadRequest';
export { MethodNotAllowed } from './Error/MethodNotAllowed';
export { Conflict } from './Error/Conflict';
export { InternalError } from './Error/InternalError';