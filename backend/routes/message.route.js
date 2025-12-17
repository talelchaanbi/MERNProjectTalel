const express = require('express');
const router = express.Router();
const { createMessage, getMessages, getMessage, markRead } = require('../controllers/message.controller');
const requireRole = require('../middleware/requireRole');

// Public endpoint to create a message
router.post('/', createMessage);

// Admin-only endpoints
router.get('/', requireRole('ADMIN'), getMessages);
router.get('/:id', requireRole('ADMIN'), getMessage);
router.patch('/:id/read', requireRole('ADMIN'), markRead);

module.exports = router;
