const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { recommendJobs, recommendConsultants } = require('../controllers/recommendation.controller');

const router = express.Router();

router.get('/jobs', auth, requireRole('CONSULTANT'), recommendJobs);
router.get('/consultants', auth, requireRole('RECRUT', 'ADMIN'), recommendConsultants);

module.exports = router;