const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createJob,
  listJobs,
  listMyJobs,
  getJob,
  updateJob,
  deleteJob,
} = require('../controllers/job.controller');

const router = express.Router();

router.get('/', listJobs);
router.get('/mine', auth, requireRole('RECRUT', 'ADMIN'), listMyJobs);
router.get('/:id', getJob);
router.post('/', auth, requireRole('RECRUT', 'ADMIN'), createJob);
router.put('/:id', auth, requireRole('RECRUT', 'ADMIN'), updateJob);
router.delete('/:id', auth, requireRole('RECRUT', 'ADMIN'), deleteJob);

module.exports = router;