const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getSummary } = require('../controllers/stats.controller');

const router = express.Router();

router.get('/summary', auth, requireRole('ADMIN'), getSummary);

module.exports = router;