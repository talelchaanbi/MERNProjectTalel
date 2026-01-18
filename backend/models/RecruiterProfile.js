const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true },
    sector: { type: String, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    hrContact: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);