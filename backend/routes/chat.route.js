const express = require('express');
const auth = require('../middleware/auth');
const {
  getOrCreateThread,
  listThreads,
  listMessages,
  sendMessage,
} = require('../controllers/chat.controller');

const router = express.Router();

router.post('/threads', auth, getOrCreateThread);
router.get('/threads', auth, listThreads);
router.get('/threads/:id/messages', auth, listMessages);
router.post('/threads/:id/messages', auth, sendMessage);

module.exports = router;