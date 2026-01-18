const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, trim: true },
    cvUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true, versionKey: false }
);

applicationSchema.index({ job: 1, consultant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);