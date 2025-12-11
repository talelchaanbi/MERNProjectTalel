const { RequestValidationError } = require('./validator');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{6,15}$/;

const sanitize = (value) => (typeof value === 'string' ? value.trim() : '');

const throwOnErrors = (errors) => {
	if (errors.length) {
		throw new RequestValidationError(errors);
	}
};

const validateRegister = (req) => {
	const errors = [];
	const body = req.body || {};

	const username = sanitize(body.username);
	if (!username) {
		errors.push({ field: 'username', message: 'Username is required.' });
	} else if (username.length < 3) {
		errors.push({ field: 'username', message: 'Username must be at least 3 characters long.' });
	}

	const email = sanitize(body.email).toLowerCase();
	if (!email) {
		errors.push({ field: 'email', message: 'Email is required.' });
	} else if (!emailPattern.test(email)) {
		errors.push({ field: 'email', message: 'Email format is invalid.' });
	}

	const password = typeof body.password === 'string' ? body.password : '';
	if (!password) {
		errors.push({ field: 'password', message: 'Password is required.' });
	} else if (password.length < 6) {
		errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
	}

	const phoneRaw = body.phone;
	let phone;
	if (phoneRaw !== undefined && phoneRaw !== null && phoneRaw !== '') {
		phone = sanitize(String(phoneRaw));
		const digitsOnly = phone.replace(/\D/g, '');
		if (!phonePattern.test(digitsOnly)) {
			errors.push({ field: 'phone', message: 'Phone number must contain between 6 and 15 digits.' });
		}
	}

	const role = sanitize(body.role);
	if (!role) {
		errors.push({ field: 'role', message: 'Role is required.' });
	}

	throwOnErrors(errors);

	req.body.username = username;
	req.body.email = email;
	req.body.password = password;
	req.body.role = role;
	if (phone !== undefined) {
		req.body.phone = phone;
	} else {
		delete req.body.phone;
	}
};

const validateLogin = (req) => {
	const errors = [];
	const body = req.body || {};

	const email = sanitize(body.email).toLowerCase();
	if (!email) {
		errors.push({ field: 'email', message: 'Email is required.' });
	} else if (!emailPattern.test(email)) {
		errors.push({ field: 'email', message: 'Email format is invalid.' });
	}

	const password = typeof body.password === 'string' ? body.password : '';
	if (!password) {
		errors.push({ field: 'password', message: 'Password is required.' });
	}

	throwOnErrors(errors);

	req.body.email = email;
	req.body.password = password;
};

module.exports = {
	validateRegister,
	validateLogin,
};
