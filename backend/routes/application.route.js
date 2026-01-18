const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  applyToJob,
  listMyApplications,
  listApplicationsForJob,
  updateApplicationStatus,
} = require('../controllers/application.controller');

const router = express.Router();

router.post('/', auth, requireRole('CONSULTANT'), applyToJob);
router.get('/me', auth, requireRole('CONSULTANT'), listMyApplications);
router.get('/job/:jobId', auth, requireRole('RECRUT', 'ADMIN'), listApplicationsForJob);
router.patch('/:id/status', auth, requireRole('RECRUT', 'ADMIN'), updateApplicationStatus);

module.exports = router;