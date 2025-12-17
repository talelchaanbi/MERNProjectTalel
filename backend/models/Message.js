const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  organization: { type: String, required: false },
  message: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
