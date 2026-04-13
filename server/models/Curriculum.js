const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const subjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    children: { type: [topicSchema], default: [] },
  },
  { _id: true }
);

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subjects: { type: [subjectSchema], default: [] },
  },
  { _id: true }
);

const curriculumSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    categories: { type: [categorySchema], default: [] },
    updatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Curriculum', curriculumSchema);
