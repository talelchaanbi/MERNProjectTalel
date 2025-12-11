const express = require('express');
const { register, login, currentUser, logout } = require('../controllers/auth.controller');
const upload = require('../utils/multer');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.get('/me', auth, currentUser);
router.post('/logout', auth, logout);

module.exports = router;