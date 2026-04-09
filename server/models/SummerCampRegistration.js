const mongoose = require('mongoose');

const summerCampRegistrationSchema = new mongoose.Schema(
  {
    registrationCampId: { type: String, required: true, trim: true },
    registrationCampTitle: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    guardianName: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    motherTongue: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    childName: { type: String, required: true, trim: true },
    childAge: { type: Number, required: true, min: 1, max: 21 },
    gender: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    currentClass: { type: String, required: true, trim: true },
    interestedBatches: { type: [String], default: [] },
    familyMembersStaying: { type: String, required: true, trim: true },
    transactionNote: { type: String, default: '', trim: true },
    paymentScreenshotUrl: { type: String, default: '', trim: true },
    source: { type: String, required: true, trim: true },
    sourceOther: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'confirmed', 'rejected'],
      default: 'new',
    },
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SummerCampRegistration', summerCampRegistrationSchema);
