const express = require('express');
const SummerCampRegistration = require('../models/SummerCampRegistration');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function normalizePayload(payload = {}) {
  return {
    registrationCampId: String(payload.registrationCampId || '').trim(),
    registrationCampTitle: String(payload.registrationCampTitle || '').trim(),
    email: String(payload.email || '').trim(),
    guardianName: String(payload.guardianName || '').trim(),
    relationship: String(payload.relationship || '').trim(),
    mobileNumber: String(payload.mobileNumber || '').trim(),
    motherTongue: String(payload.motherTongue || '').trim(),
    country: String(payload.country || '').trim(),
    state: String(payload.state || '').trim(),
    city: String(payload.city || '').trim(),
    childName: String(payload.childName || '').trim(),
    childAge: Number(payload.childAge),
    gender: String(payload.gender || '').trim(),
    schoolName: String(payload.schoolName || '').trim(),
    currentClass: String(payload.currentClass || '').trim(),
    interestedBatches: Array.isArray(payload.interestedBatches)
      ? payload.interestedBatches.map((x) => String(x).trim()).filter(Boolean)
      : [],
    familyMembersStaying: String(payload.familyMembersStaying || '').trim(),
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
    'email',
    'guardianName',
    'relationship',
    'mobileNumber',
    'motherTongue',
    'country',
    'state',
    'city',
    'childName',
    'gender',
    'schoolName',
    'currentClass',
    'familyMembersStaying',
    'source',
  ];
  const missing = requiredFields.find((key) => !String(data[key] || '').trim());
  if (missing) return `${missing} is required.`;
  if (!Number.isFinite(data.childAge) || data.childAge < 1 || data.childAge > 21) {
    return 'Child age must be between 1 and 21.';
  }
  if (!data.interestedBatches.length) {
    return 'At least one batch selection is required.';
  }
  if (data.source === 'Other' && !data.sourceOther) {
    return 'Please provide source other details.';
  }
  return '';
}

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

module.exports = router;
