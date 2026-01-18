const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../utils/multer');
const {
  getConsultantProfile,
  updateConsultantProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
} = require('../controllers/profile.controller');

const router = express.Router();

router.get('/consultant/me', auth, requireRole('CONSULTANT'), getConsultantProfile);
router.put('/consultant/me', auth, requireRole('CONSULTANT'), upload.single('cv'), updateConsultantProfile);

router.get('/recruiter/me', auth, requireRole('RECRUT', 'ADMIN'), getRecruiterProfile);
router.put('/recruiter/me', auth, requireRole('RECRUT', 'ADMIN'), upload.single('logo'), updateRecruiterProfile);

module.exports = router;