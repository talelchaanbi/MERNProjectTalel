const mongoose = require('mongoose');

const consultantProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, required: false },
    level: { type: String, enum: ['JUNIOR', 'MID', 'SENIOR', 'EXPERT'], default: 'MID' },
    availability: { type: String, trim: true },
    location: { type: String, trim: true },
    salaryExpectation: { type: Number, required: false },
    cvUrl: { type: String, trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('ConsultantProfile', consultantProfileSchema);