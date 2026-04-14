const express = require('express');
const multer = require('multer');
const SummerCampRegistration = require('../models/SummerCampRegistration');
const WinterCampRegistration = require('../models/WinterCampRegistration');
const OnlineCourseRegistration = require('../models/OnlineCourseRegistration');
const { authRequired } = require('../middleware/auth');
const { uploadImage } = require('../services/s3');
const { normalizeEmail, isValidEmail } = require('../utils/email');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function normalizePayload(payload = {}) {
  const children = Array.isArray(payload.children) ? payload.children : [];
  let normalizedChildren = children.map((child) => ({
    name: String(child?.name || '').trim(),
    age: Number(child?.age),
    gender: String(child?.gender || '').trim(),
    dob: String(child?.dob || '').trim(),
    school: String(child?.school || '').trim(),
    currentClass: String(child?.currentClass || '').trim(),
    schoolName: String(child?.schoolName || child?.school || '').trim(),
    interestedBatches: Array.isArray(child?.interestedBatches)
      ? child.interestedBatches.map((x) => String(x || '').trim()).filter(Boolean)
      : [],
  }));
  if (!normalizedChildren.length && String(payload.childName || '').trim()) {
    normalizedChildren = [
      {
        name: String(payload.childName || '').trim(),
        age: Number(payload.childAge),
        gender: String(payload.gender || '').trim(),
        dob: String(payload.dob || '').trim(),
        school: String(payload.school || payload.schoolName || '').trim(),
        currentClass: String(payload.currentClass || '').trim(),
        schoolName: String(payload.schoolName || '').trim(),
        interestedBatches: Array.isArray(payload.interestedBatches)
          ? payload.interestedBatches.map((x) => String(x || '').trim()).filter(Boolean)
          : [],
      },
    ];
  }
  const firstChild = normalizedChildren[0] || {};
  const familyMembers = Array.isArray(payload.familyMembers) ? payload.familyMembers : [];
  const mergedParentEmail = normalizeEmail(payload.parentEmail || payload.email || '');
  return {
    registrationCampId: String(payload.registrationCampId || '').trim(),
    registrationCampTitle: String(payload.registrationCampTitle || '').trim(),
    parentEmail: mergedParentEmail,
    parentName: String(payload.parentName || payload.guardianName || '').trim(),
    email: mergedParentEmail,
    guardianName: String(payload.guardianName || payload.parentName || '').trim(),
    relationship: String(payload.relationship || '').trim(),
    mobileNumber: String(payload.mobileNumber || '').trim(),
    motherTongue: String(payload.motherTongue || '').trim(),
    country: String(payload.country || '').trim(),
    state: String(payload.state || '').trim(),
    city: String(payload.city || '').trim(),
    childName: String(payload.childName || firstChild.name || '').trim(),
    childAge: Number(payload.childAge ?? firstChild.age),
    gender: String(payload.gender || firstChild.gender || '').trim(),
    schoolName: String(payload.schoolName || firstChild.schoolName || '').trim(),
    currentClass: String(payload.currentClass || firstChild.currentClass || '').trim(),
    interestedBatches: Array.isArray(payload.interestedBatches)
      ? payload.interestedBatches.map((x) => String(x).trim()).filter(Boolean)
      : Array.isArray(firstChild.interestedBatches)
        ? firstChild.interestedBatches
        : [],
    children: normalizedChildren,
    familyMembers: familyMembers.map((member) => ({
      name: String(member?.name || '').trim(),
      relationWithChild: String(member?.relationWithChild || '').trim(),
      stayingDays: Number(member?.stayingDays),
    })),
    familyMembersStaying: String(payload.familyMembersStaying || '').trim(),
    registrationFee: Number(payload.registrationFee) || 0,
    perPersonPerDayPrice: Number(payload.perPersonPerDayPrice) || 0,
    childStayDaysTotal: Number(payload.childStayDaysTotal) || 0,
    familyStayDaysTotal: Number(payload.familyStayDaysTotal) || 0,
    totalAmountPayable: Number(payload.totalAmountPayable) || 0,
    transactionNote: String(payload.transactionNote || '').trim(),
    paymentScreenshotUrl: String(payload.paymentScreenshotUrl || '').trim(),
    source: String(payload.source || '').trim(),
    sourceOther: String(payload.sourceOther || '').trim(),
    status: String(payload.status || 'new').trim(),
    createdByAdmin: !!payload.createdByAdmin,
  };
}

function validateRequired(data) {
  const requiredFields = [
    'registrationCampId',
    'registrationCampTitle',
    'parentEmail',
    'parentName',
    'relationship',
    'mobileNumber',
    'motherTongue',
    'country',
    'state',
    'city',
    'source',
  ];
  const missing = requiredFields.find((key) => !String(data[key] || '').trim());
  if (missing) return `${missing} is required.`;
  if (!isValidEmail(data.parentEmail)) {
    return 'Enter a valid parent email address.';
  }
  if (!Array.isArray(data.children) || !data.children.length) {
    return 'At least one child is required.';
  }
  const invalidChild = data.children.find(
    (child) =>
      !child.name ||
      !Number.isFinite(child.age) ||
      child.age < 1 ||
      child.age > 21 ||
      !child.gender ||
      !child.dob ||
      !child.school ||
      !child.currentClass ||
      !Array.isArray(child.interestedBatches) ||
      !child.interestedBatches.length
  );
  if (invalidChild) {
    return 'Child details are incomplete.';
  }
  const invalidFamilyMember = (data.familyMembers || []).find(
    (member) =>
      !member.name ||
      !member.relationWithChild ||
      !Number.isFinite(member.stayingDays) ||
      member.stayingDays < 1
  );
  if (invalidFamilyMember) {
    return 'Family member details are incomplete.';
  }
  if (data.source === 'Other' && !data.sourceOther) {
    return 'Please provide source other details.';
  }
  return '';
}

function normalizeOnlineCoursePayload(payload = {}) {
  const parent1 = payload?.parents?.parent1 || {};
  const parent2 = payload?.parents?.parent2 || {};
  const address = payload?.address || {};
  const occupation = payload?.occupation || {};
  const children = Array.isArray(payload?.children) ? payload.children : [];
  return {
    parents: {
      parent1: {
        name: String(parent1.name || '').trim(),
        email: normalizeEmail(parent1.email || ''),
        phone: String(parent1.phone || '').trim(),
      },
      parent2: {
        name: String(parent2.name || '').trim(),
        email: normalizeEmail(parent2.email || ''),
        phone: String(parent2.phone || '').trim(),
      },
    },
    address: {
      country: String(address.country || '').trim(),
      city: String(address.city || '').trim(),
      address: String(address.address || '').trim(),
      zipcode: String(address.zipcode || '').trim(),
    },
    occupation: {
      role: String(occupation.role || '').trim(),
      type: String(occupation.type || '').trim(),
    },
    children: children.map((child) => ({
      name: String(child?.name || '').trim(),
      age: Number(child?.age),
      gender: String(child?.gender || '').trim(),
      dob: String(child?.dob || '').trim(),
      school: String(child?.school || '').trim(),
      class: String(child?.class || '').trim(),
      courses: Array.isArray(child?.courses)
        ? child.courses.map((course) => ({
            courseName: String(course?.courseName || '').trim(),
            timeSlotIST: String(course?.timeSlotIST || '').trim(),
            localTime: String(course?.localTime || '').trim(),
          }))
        : [],
    })),
  };
}

function validateOnlineCourseRequired(data) {
  if (!data.parents.parent1.name || !data.parents.parent1.email || !data.parents.parent1.phone) {
    return 'Parent 1 details are required.';
  }
  if (!isValidEmail(data.parents.parent1.email)) {
    return 'Enter a valid email for Parent 1.';
  }
  if (data.parents.parent2.email && !isValidEmail(data.parents.parent2.email)) {
    return 'Parent 2 email is invalid.';
  }
  if (!data.address.country || !data.address.city || !data.address.address || !data.address.zipcode) {
    return 'Address details are required.';
  }
  if (!data.occupation.role || !data.occupation.type) {
    return 'Occupation details are required.';
  }
  if (!Array.isArray(data.children) || !data.children.length) {
    return 'At least one child is required.';
  }
  const invalidChild = data.children.find(
    (child) =>
      !child.name ||
      !Number.isFinite(child.age) ||
      child.age < 1 ||
      !child.gender ||
      !child.dob ||
      !child.school ||
      !child.class ||
      !Array.isArray(child.courses) ||
      !child.courses.length ||
      child.courses.some((course) => !course.courseName || !course.timeSlotIST)
  );
  if (invalidChild) {
    return 'Child details are incomplete.';
  }
  return '';
}

router.post('/upload-payment-screenshot', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image size must be 10MB or less.' });
    }
    if (err) {
      return res.status(400).json({ message: 'Invalid upload request.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }
    try {
      const uploaded = await uploadImage({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        folder: 'payments',
      });
      return res.status(201).json({ url: uploaded.url, key: uploaded.key });
    } catch (uploadError) {
      return res.status(uploadError?.status || 500).json({
        message: uploadError?.message || 'Unable to upload payment screenshot.',
      });
    }
  });
});

router.post('/summer-camp', async (req, res) => {
  const data = normalizePayload(req.body || {});
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await SummerCampRegistration.create(data);
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'created', item: row, source: 'public' });
  return res.status(201).json({ item: row });
});

router.get('/admin/summer-camp', authRequired, async (req, res) => {
  const items = await SummerCampRegistration.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ items });
});

router.post('/admin/summer-camp', authRequired, async (req, res) => {
  const data = normalizePayload({ ...(req.body || {}), createdByAdmin: true });
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await SummerCampRegistration.create(data);
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'created', item: row, source: 'admin' });
  return res.status(201).json({ item: row });
});

router.put('/admin/summer-camp/:id', authRequired, async (req, res) => {
  const data = normalizePayload(req.body || {});
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await SummerCampRegistration.findByIdAndUpdate(
    req.params.id,
    data,
    { returnDocument: 'after' }
  ).lean();
  if (!row) {
    return res.status(404).json({ message: 'Registration not found.' });
  }
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'updated', item: row, source: 'admin' });
  return res.json({ item: row });
});

router.delete('/admin/summer-camp/:id', authRequired, async (req, res) => {
  const row = await SummerCampRegistration.findByIdAndDelete(req.params.id).lean();
  if (!row) {
    return res.status(404).json({ message: 'Registration not found.' });
  }
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'deleted', id: String(req.params.id), source: 'admin' });
  return res.json({ ok: true });
});

router.post('/winter-camp', async (req, res) => {
  const data = normalizePayload(req.body || {});
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await WinterCampRegistration.create(data);
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'created', item: row, source: 'public' });
  return res.status(201).json({ item: row });
});

router.get('/admin/winter-camp', authRequired, async (req, res) => {
  const items = await WinterCampRegistration.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ items });
});

router.post('/admin/winter-camp', authRequired, async (req, res) => {
  const data = normalizePayload({ ...(req.body || {}), createdByAdmin: true });
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await WinterCampRegistration.create(data);
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'created', item: row, source: 'admin' });
  return res.status(201).json({ item: row });
});

router.put('/admin/winter-camp/:id', authRequired, async (req, res) => {
  const data = normalizePayload(req.body || {});
  const error = validateRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await WinterCampRegistration.findByIdAndUpdate(
    req.params.id,
    data,
    { returnDocument: 'after' }
  ).lean();
  if (!row) {
    return res.status(404).json({ message: 'Registration not found.' });
  }
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'updated', item: row, source: 'admin' });
  return res.json({ item: row });
});

router.delete('/admin/winter-camp/:id', authRequired, async (req, res) => {
  const row = await WinterCampRegistration.findByIdAndDelete(req.params.id).lean();
  if (!row) {
    return res.status(404).json({ message: 'Registration not found.' });
  }
  const io = req.app.get('io');
  io?.emit('registrations:updated', { action: 'deleted', id: String(req.params.id), source: 'admin' });
  return res.json({ ok: true });
});

router.post('/online-course', async (req, res) => {
  const data = normalizeOnlineCoursePayload(req.body || {});
  const error = validateOnlineCourseRequired(data);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const row = await OnlineCourseRegistration.create(data);
  return res.status(201).json({ item: row });
});

router.get('/admin/online-course', authRequired, async (req, res) => {
  const items = await OnlineCourseRegistration.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ items });
});

module.exports = router;
