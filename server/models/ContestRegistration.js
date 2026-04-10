const mongoose = require('mongoose');

const contestRegistrationSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      index: true,
    },
    contestTitle: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobileNumber: { type: String, required: true, trim: true },
    watchedRulesVideo: { type: Boolean, required: true },
    joinedArattaiCommunity: { type: Boolean, required: true },
    shortVideoLink: { type: String, required: true, trim: true },
    socialPlatforms: [{ type: String }],
    strategySummary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContestRegistration', contestRegistrationSchema);
