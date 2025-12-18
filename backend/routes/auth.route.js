const express = require('express');
const { register, login, currentUser, logout, getAllUsers, updateProfile, updateUserStatus, deleteUser, updateUserByAdmin, getUserById, verifyEmail, resendVerification } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../controllers/validations/authValidations');
const { validate } = require('../controllers/validations/validator');
const upload = require('../utils/multer');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post(
	'/register',
	// Public registration: allow unauthenticated users to create non-ADMIN accounts.
	// Admin users (authenticated) may still create users with any role via this endpoint.
	upload.single('profilePicture'),
	validate(validateRegister),
	register
);
router.post('/resend-verification', require('express').json(), resendVerification);
router.get('/verify', verifyEmail);
router.post('/login', validate(validateLogin), login);
router.get('/me', auth, currentUser);
router.put('/me', auth, upload.single('profilePicture'), updateProfile);
router.post('/logout', auth, logout);
router.get('/users', auth, requireRole('ADMIN'), getAllUsers);
router.put('/users/:id/status', auth, requireRole('ADMIN'), updateUserStatus);
router.delete('/users/:id', auth, requireRole('ADMIN'), deleteUser);
router.put('/users/:id', auth, requireRole('ADMIN'), upload.single('profilePicture'), updateUserByAdmin);
router.get('/users/:id', auth, requireRole('ADMIN'), getUserById);

module.exports = router;
