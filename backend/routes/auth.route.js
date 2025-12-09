const express = require('express');
const { register, login, currentUser } = require('../controllers/auth.controller');
const upload = require('../utils/multer');

const router = express.Router();

router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.get('/me', currentUser);

module.exports = router;