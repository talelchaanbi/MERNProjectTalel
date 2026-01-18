const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Post = require('../models/Post');
const Message = require('../models/Message');

const getSummary = async (req, res) => {
  try {
    const [
      users,
      jobs,
      applications,
      posts,
      messages,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      Job.countDocuments(),
      Application.countDocuments(),
      Post.countDocuments(),
      Message.countDocuments(),
    ]);

    const roles = await User.find({ deletedAt: null }).populate('role').select('role').lean();
    const consultantCount = roles.filter((u) => u.role?.lib === 'CONSULTANT').length;
    const recruiterCount = roles.filter((u) => u.role?.lib === 'RECRUT').length;

    res.json({
      users,
      consultants: consultantCount,
      recruiters: recruiterCount,
      jobs,
      applications,
      posts,
      messages,
    });
  } catch (err) {
    console.error('getSummary error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getSummary };