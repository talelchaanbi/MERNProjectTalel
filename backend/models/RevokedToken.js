const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
