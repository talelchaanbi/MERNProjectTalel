const Notification = require('../models/Notification');

const listNotifications = async (req, res) => {
  try {
    const { limit = 30 } = req.query || {};
    const items = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 30)
      .lean();
    res.json(items);
  } catch (err) {
    console.error('listNotifications error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const unreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.userId, read: false });
    res.json({ unread: count });
  } catch (err) {
    console.error('unreadCount error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Notification.findOne({ _id: id, user: req.userId });
    if (!doc) return res.status(404).json({ msg: 'Not found' });
    doc.read = true;
    await doc.save();
    res.json({ msg: 'OK' });
  } catch (err) {
    console.error('markRead error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.json({ msg: 'OK' });
  } catch (err) {
    console.error('markAllRead error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
};