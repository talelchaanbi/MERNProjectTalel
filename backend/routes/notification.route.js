const express = require('express');
const auth = require('../middleware/auth');
const { listNotifications, unreadCount, markRead, markAllRead } = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', auth, listNotifications);
router.get('/unread-count', auth, unreadCount);
router.patch('/:id/read', auth, markRead);
router.patch('/read-all', auth, markAllRead);

module.exports = router;