const express = require('express');
const Contest = require('../models/Contest');
const ContestRegistration = require('../models/ContestRegistration');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await Contest.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .select('title description submitDate resultDate heroImages registerMode registerButtonText createdAt')
    .lean();
  return res.json({ items });
});

router.get('/:id', async (req, res) => {
  const contest = await Contest.findOne({ _id: req.params.id, isPublished: true }).lean();
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }
  return res.json({ contest });
});

router.post('/:id/register', async (req, res) => {
  const contest = await Contest.findOne({ _id: req.params.id, isPublished: true });
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }
  if (contest.registerMode !== 'internal') {
    return res.status(400).json({ message: 'This contest uses external registration.' });
  }

  const body = req.body || {};
  const payload = {
    contest: contest._id,
    contestTitle: contest.title,
    fullName: body.fullName || '',
    email: body.email || '',
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

  const saved = await ContestRegistration.create(payload);
  return res.status(201).json({ id: saved._id, message: 'Registration submitted successfully.' });
});

module.exports = router;
