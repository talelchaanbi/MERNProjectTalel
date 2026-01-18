const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    experienceLevel: {
      type: String,
      enum: ['JUNIOR', 'MID', 'SENIOR', 'EXPERT'],
      default: 'MID',
    },
    contractType: { type: String, trim: true, default: 'CDI' },
    salaryMin: { type: Number, required: false },
    salaryMax: { type: Number, required: false },
    currency: { type: String, trim: true, default: 'EUR' },
    remote: { type: Boolean, default: false },
    skills: [{ type: String, trim: true }],
    companyName: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true, versionKey: false }
);

jobSchema.index({ title: 'text', description: 'text', companyName: 'text', location: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);