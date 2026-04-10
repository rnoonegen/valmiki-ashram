const mongoose = require('mongoose');

const sectionBlockSchema = new mongoose.Schema(
  {
    subHeading: { type: String, default: '' },
    paragraphs: [{ type: String }],
    bulletPoints: [{ type: String }],
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    blocks: [sectionBlockSchema],
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    submitDate: { type: Date, default: null },
    resultDate: { type: Date, default: null },
    heroImages: [{ type: String }],
    heroVideoLinks: [{ type: String }],
    registerButtonText: { type: String, default: 'Register Now' },
    registerMode: {
      type: String,
      enum: ['internal', 'google'],
      default: 'internal',
    },
    googleFormUrl: { type: String, default: '' },
    sections: [sectionSchema],
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contest', contestSchema);
