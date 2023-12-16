export class BaseError extends Error {
	constructor(name, httpCode, description, isOperational) {
		super(description);
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name;
		this.httpCode = httpCode;
		this.isOperational = isOperational;
		this.description = description;

		Error.captureStackTrace(this);
	}
}

export class ApiError extends BaseError {
	constructor(
		name,
		httpCode = 500,
		description = "Internal server error",
		isOperational = false
	) {
		console.log(name, httpCode, description, isOperational);
		super(name, httpCode, description, isOperational);
	}
}

export class ValidationError extends BaseError {
	constructor(
		name,
		httpCode = 400,
		description = "Bad Request",
		isOperational = true
	) {
		super(name, httpCode, isOperational, description);
	}
}

export class UploadError extends Error {
	constructor(name, httpCode, description, isOperational, fileNames) {
		super(description);
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name;
		this.httpCode = httpCode;
		this.isOperational = isOperational;
		this.description = description;
		this.fileNames = fileNames;

		Error.captureStackTrace(this);
	}
}
