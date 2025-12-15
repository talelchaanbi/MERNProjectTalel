const express = require('express');
const { register, login, currentUser, logout, getAllUsers } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../controllers/validations/authValidations');
const { validate } = require('../controllers/validations/validator');
const upload = require('../utils/multer');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post(
	'/register',
	auth,
	requireRole('ADMIN'),
	upload.single('profilePicture'),
	validate(validateRegister),
	register
);
router.post('/login', validate(validateLogin), login);
router.get('/me', auth, currentUser);
router.post('/logout', auth, logout);
router.get('/users', auth, requireRole('ADMIN'), getAllUsers);

module.exports = router;
