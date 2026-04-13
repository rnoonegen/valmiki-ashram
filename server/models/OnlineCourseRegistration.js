const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, trim: true },
    timeSlotIST: { type: String, required: true, trim: true },
    localTime: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, required: true, trim: true },
    dob: { type: String, required: true, trim: true },
    school: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    courses: { type: [courseSchema], default: [] },
  },
  { _id: false }
);

const onlineCourseRegistrationSchema = new mongoose.Schema(
  {
    parents: {
      parent1: {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
      },
      parent2: {
        name: { type: String, default: '', trim: true },
        email: { type: String, default: '', trim: true },
        phone: { type: String, default: '', trim: true },
      },
    },
    address: {
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      zipcode: { type: String, required: true, trim: true },
    },
    occupation: {
      role: { type: String, required: true, trim: true },
      type: { type: String, required: true, trim: true },
    },
    children: { type: [childSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnlineCourseRegistration', onlineCourseRegistrationSchema);
