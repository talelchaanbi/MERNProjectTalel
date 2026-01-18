const Application = require('../models/Application');
const Job = require('../models/Job');

const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter, cvUrl } = req.body || {};
    if (!jobId) return res.status(400).json({ msg: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.status !== 'OPEN') return res.status(400).json({ msg: 'Job is closed' });

    const existing = await Application.findOne({ job: jobId, consultant: req.userId });
    if (existing) return res.status(400).json({ msg: 'Already applied to this job' });

    const app = await Application.create({
      job: jobId,
      consultant: req.userId,
      coverLetter: coverLetter ? String(coverLetter).trim() : undefined,
      cvUrl: cvUrl ? String(cvUrl).trim() : undefined,
    });

    res.status(201).json(app);
  } catch (err) {
    console.error('applyToJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ consultant: req.userId })
      .populate('job')
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    console.error('listMyApplications error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const requesterRole = String(req.userRole || '').toUpperCase();
    const isAdmin = requesterRole === 'ADMIN';
    if (!isAdmin && String(job.createdBy) !== String(req.userId)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const apps = await Application.find({ job: jobId })
      .populate('consultant', 'username email phone profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    console.error('listApplicationsForJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ msg: 'Application not found' });

    const requesterRole = String(req.userRole || '').toUpperCase();
    const isAdmin = requesterRole === 'ADMIN';
    if (!isAdmin && String(app.job.createdBy) !== String(req.userId)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const normalized = String(status || '').trim().toUpperCase();
    const allowed = ['PENDING', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
    if (!allowed.includes(normalized)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    app.status = normalized;
    await app.save();
    res.json(app);
  } catch (err) {
    console.error('updateApplicationStatus error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  applyToJob,
  listMyApplications,
  listApplicationsForJob,
  updateApplicationStatus,
};