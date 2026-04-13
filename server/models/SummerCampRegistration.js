const mongoose = require('mongoose');

const summerCampRegistrationSchema = new mongoose.Schema(
  {
    registrationCampId: { type: String, required: true, trim: true },
    registrationCampTitle: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    guardianName: { type: String, default: '', trim: true },
    relationship: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    motherTongue: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    childName: { type: String, default: '', trim: true },
    childAge: { type: Number, min: 1, max: 21 },
    gender: { type: String, default: '', trim: true },
    schoolName: { type: String, default: '', trim: true },
    currentClass: { type: String, default: '', trim: true },
    interestedBatches: { type: [String], default: [] },
    children: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          age: { type: Number, required: true, min: 1, max: 21 },
          gender: { type: String, required: true, trim: true },
          dob: { type: String, required: true, trim: true },
          school: { type: String, required: true, trim: true },
          currentClass: { type: String, required: true, trim: true },
          schoolName: { type: String, required: true, trim: true },
          interestedBatches: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    familyMembers: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          relationWithChild: { type: String, required: true, trim: true },
          stayingDays: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
    },
    familyMembersStaying: { type: String, default: '', trim: true },
    registrationFee: { type: Number, default: 0, min: 0 },
    perPersonPerDayPrice: { type: Number, default: 0, min: 0 },
    childStayDaysTotal: { type: Number, default: 0, min: 0 },
    familyStayDaysTotal: { type: Number, default: 0, min: 0 },
    totalAmountPayable: { type: Number, default: 0, min: 0 },
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
