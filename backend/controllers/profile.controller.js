const ConsultantProfile = require('../models/ConsultantProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

const buildFileUrl = (req, file) => {
  if (!file?.filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

const normalizeSkills = (input) => {
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

const getConsultantProfile = async (req, res) => {
  try {
    const profile = await ConsultantProfile.findOne({ user: req.userId }).lean();
    res.json(profile || { user: req.userId, skills: [] });
  } catch (err) {
    console.error('getConsultantProfile error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateConsultantProfile = async (req, res) => {
  try {
    const payload = req.body || {};
    const update = {
      headline: payload.headline,
      skills: normalizeSkills(payload.skills),
      experienceYears: payload.experienceYears !== undefined ? Number(payload.experienceYears) : undefined,
      level: payload.level ? String(payload.level).trim().toUpperCase() : undefined,
      availability: payload.availability,
      location: payload.location,
      salaryExpectation: payload.salaryExpectation !== undefined ? Number(payload.salaryExpectation) : undefined,
      bio: payload.bio,
    };

    const cvUrl = buildFileUrl(req, req.file);
    if (cvUrl) update.cvUrl = cvUrl;

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const profile = await ConsultantProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: update, $setOnInsert: { user: req.userId } },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error('updateConsultantProfile error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getRecruiterProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ user: req.userId }).lean();
    res.json(profile || { user: req.userId });
  } catch (err) {
    console.error('getRecruiterProfile error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateRecruiterProfile = async (req, res) => {
  try {
    const payload = req.body || {};
    const update = {
      companyName: payload.companyName,
      sector: payload.sector,
      description: payload.description,
      address: payload.address,
      hrContact: payload.hrContact,
    };

    const logoUrl = buildFileUrl(req, req.file);
    if (logoUrl) update.logoUrl = logoUrl;

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: update, $setOnInsert: { user: req.userId } },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error('updateRecruiterProfile error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getConsultantProfile,
  updateConsultantProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
};