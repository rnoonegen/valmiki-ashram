const express = require('express');
const Contest = require('../models/Contest');
const ContestRegistration = require('../models/ContestRegistration');
const { isRegistrationOpen, attachRegistrationOpen } = require('../utils/contestRegistrationOpen');
const { normalizeEmail, isValidEmail } = require('../utils/email');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await Contest.find({})
    .sort({ createdAt: -1 })
    .select(
      'title description submitDate resultDate heroImages registerMode registerButtonText createdAt registrationOpen isPublished'
    )
    .lean();
  return res.json({ items: items.map((item) => attachRegistrationOpen(item)) });
});

router.get('/:id', async (req, res) => {
  const contest = await Contest.findById(req.params.id).lean();
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }
  return res.json({ contest: attachRegistrationOpen(contest) });
});

router.post('/:id/register', async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }
  if (!isRegistrationOpen(contest)) {
    return res.status(403).json({ message: 'Registration is closed for this contest.' });
  }
  if (contest.registerMode !== 'internal') {
    return res.status(400).json({ message: 'This contest uses external registration.' });
  }

  const body = req.body || {};
  const payload = {
    contest: contest._id,
    contestTitle: contest.title,
    fullName: body.fullName || '',
    email: normalizeEmail(body.email || ''),
    mobileNumber: body.mobileNumber || '',
    watchedRulesVideo: Boolean(body.watchedRulesVideo),
    joinedArattaiCommunity: Boolean(body.joinedArattaiCommunity),
    shortVideoLink: body.shortVideoLink || '',
    socialPlatforms: Array.isArray(body.socialPlatforms) ? body.socialPlatforms : [],
    strategySummary: body.strategySummary || '',
  };

  if (!payload.fullName || !payload.email || !payload.mobileNumber || !payload.shortVideoLink) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  if (!isValidEmail(payload.email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  const saved = await ContestRegistration.create(payload);
  return res.status(201).json({ id: saved._id, message: 'Registration submitted successfully.' });
});

module.exports = router;
