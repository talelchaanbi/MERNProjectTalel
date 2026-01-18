const Job = require('../models/Job');

const normalizeSkills = (input) => {
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      experienceLevel,
      contractType,
      salaryMin,
      salaryMax,
      currency,
      remote,
      skills,
      companyName,
    } = req.body || {};

    if (!title || !description || !location) {
      return res.status(400).json({ msg: 'title, description and location are required' });
    }

    const job = await Job.create({
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      experienceLevel: experienceLevel ? String(experienceLevel).trim().toUpperCase() : undefined,
      contractType: contractType ? String(contractType).trim() : undefined,
      salaryMin: salaryMin !== undefined ? Number(salaryMin) : undefined,
      salaryMax: salaryMax !== undefined ? Number(salaryMax) : undefined,
      currency: currency ? String(currency).trim().toUpperCase() : undefined,
      remote: remote === true || remote === 'true',
      skills: normalizeSkills(skills),
      companyName: companyName ? String(companyName).trim() : undefined,
      createdBy: req.userId,
    });

    res.status(201).json(job);
  } catch (err) {
    console.error('createJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listJobs = async (req, res) => {
  try {
    const { q, location, level, skill, remote, status } = req.query || {};
    const filter = {};

    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }
    if (location && location.trim()) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    }
    if (level && level.trim()) {
      filter.experienceLevel = level.trim().toUpperCase();
    }
    if (skill && String(skill).trim()) {
      filter.skills = { $in: normalizeSkills(skill) };
    }
    if (typeof remote !== 'undefined') {
      filter.remote = remote === 'true' || remote === true;
    }
    if (status && status.trim()) {
      filter.status = status.trim().toUpperCase();
    } else {
      filter.status = 'OPEN';
    }

    const jobs = await Job.find(filter)
      .populate('createdBy', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    res.json(jobs);
  } catch (err) {
    console.error('listJobs error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.userId })
      .populate('createdBy', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(jobs);
  } catch (err) {
    console.error('listMyJobs error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'username email role profilePicture')
      .lean();
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error('getJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const requesterRole = String(req.userRole || '').toUpperCase();
    const isAdmin = requesterRole === 'ADMIN';
    if (!isAdmin && String(job.createdBy) !== String(req.userId)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const updates = req.body || {};
    const allowed = [
      'title',
      'description',
      'location',
      'experienceLevel',
      'contractType',
      'salaryMin',
      'salaryMax',
      'currency',
      'remote',
      'skills',
      'companyName',
      'status',
    ];

    allowed.forEach((key) => {
      if (typeof updates[key] === 'undefined') return;
      if (key === 'skills') job.skills = normalizeSkills(updates.skills);
      else if (key === 'experienceLevel') job.experienceLevel = String(updates[key]).trim().toUpperCase();
      else if (key === 'status') job.status = String(updates[key]).trim().toUpperCase();
      else if (key === 'remote') job.remote = updates[key] === true || updates[key] === 'true';
      else if (key === 'salaryMin' || key === 'salaryMax') job[key] = Number(updates[key]);
      else job[key] = updates[key];
    });

    await job.save();
    res.json(job);
  } catch (err) {
    console.error('updateJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const requesterRole = String(req.userRole || '').toUpperCase();
    const isAdmin = requesterRole === 'ADMIN';
    if (!isAdmin && String(job.createdBy) !== String(req.userId)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    console.error('deleteJob error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createJob,
  listJobs,
  listMyJobs,
  getJob,
  updateJob,
  deleteJob,
};