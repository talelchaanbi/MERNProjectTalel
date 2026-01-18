const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

chatThreadSchema.index({ participants: 1 });

module.exports = mongoose.model('ChatThread', chatThreadSchema);