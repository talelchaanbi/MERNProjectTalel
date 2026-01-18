const Notification = require('../models/Notification');

const createNotification = async ({ user, type, title, body, link, metadata }) => {
  if (!user) return null;
  try {
    return await Notification.create({ user, type, title, body, link, metadata });
  } catch (err) {
    console.error('createNotification error:', err.message || err);
    return null;
  }
};

module.exports = { createNotification };