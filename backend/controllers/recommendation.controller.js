const Job = require('../models/Job');
const ConsultantProfile = require('../models/ConsultantProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

const normalize = (list) => (Array.isArray(list) ? list.map((s) => String(s).trim().toLowerCase()).filter(Boolean) : []);

const recommendJobs = async (req, res) => {
  try {
    const profile = await ConsultantProfile.findOne({ user: req.userId }).lean();
    const skills = normalize(profile?.skills || []);
    const jobs = await Job.find({ status: 'OPEN' }).sort({ createdAt: -1 }).lean();

    const scored = jobs.map((job) => {
      const jobSkills = normalize(job.skills || []);
      const overlap = jobSkills.filter((s) => skills.includes(s)).length;
      return { ...job, score: overlap };
    });

    scored.sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt));
    res.json(scored.slice(0, 10));
  } catch (err) {
    console.error('recommendJobs error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const recommendConsultants = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.userId }).lean();
    const jobSkills = normalize(jobs.flatMap((j) => j.skills || []));
    const profiles = await ConsultantProfile.find().populate('user', 'username email role profilePicture').lean();

    const scored = profiles.map((p) => {
      const skills = normalize(p.skills || []);
      const overlap = skills.filter((s) => jobSkills.includes(s)).length;
      return { ...p, score: overlap };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 10));
  } catch (err) {
    console.error('recommendConsultants error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { recommendJobs, recommendConsultants };