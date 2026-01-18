const Notification = require('../models/Notification');
const { emitToUser } = require('./realtime');

const createNotification = async ({ user, type, title, body, link, metadata }) => {
  if (!user) return null;
  try {
    const doc = await Notification.create({ user, type, title, body, link, metadata });
    emitToUser(user, 'notification', doc);
    return doc;
  } catch (err) {
    console.error('createNotification error:', err.message || err);
    return null;
  }
};

module.exports = { createNotification };