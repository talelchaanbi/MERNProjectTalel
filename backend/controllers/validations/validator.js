class RequestValidationError extends Error {
	constructor(details) {
		super('Request validation failed');
		this.name = 'RequestValidationError';
		this.status = 400;
		this.details = details;
	}
}

const validate = (validatorFn) => async (req, res, next) => {
	try {
		await Promise.resolve(validatorFn(req));
		next();
	} catch (error) {
		if (error instanceof RequestValidationError) {
			const payload = Array.isArray(error.details) && error.details.length
				? error.details
				: [{ message: 'Invalid request payload' }];
			return res.status(error.status).json({ errors: payload });
		}

		return next(error);
	}
};

module.exports = {
	validate,
	RequestValidationError,
};
