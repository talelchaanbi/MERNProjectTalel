const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: false, trim: true },
    link: { type: String, required: false, trim: true },
    read: { type: Boolean, default: false },
    metadata: { type: Object, required: false },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);