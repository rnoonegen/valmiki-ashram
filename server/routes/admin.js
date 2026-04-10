const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { ADMIN_PASSWORD, ADMIN_USERNAME } = require('../config/admin');
const { authRequired } = require('../middleware/auth');
const PageContent = require('../models/PageContent');
const MediaAsset = require('../models/MediaAsset');
const Contest = require('../models/Contest');
const ContestRegistration = require('../models/ContestRegistration');
const { uploadImage, deleteImage } = require('../services/s3');

const router = express.Router();
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 25);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

const ALLOWED_PAGES = new Set([
  'home',
  'about',
  'founders',
  'faq',
  'gallery',
  'programs',
  'winter-camp',
  'winter-camp-schedule',
  'summer-camp',
  'summer-camp-schedule',
  'online-programs',
]);

const PAGE_ALIASES = {
  summercamp: 'summer-camp',
  wintercamp: 'winter-camp',
  wintercampschedule: 'winter-camp-schedule',
  summercampschedule: 'summer-camp-schedule',
  summer_camp: 'summer-camp',
  onlineprograms: 'online-programs',
  online_programs: 'online-programs',
  winter_camp: 'winter-camp',
  winter_camp_schedule: 'winter-camp-schedule',
  summer_camp_schedule: 'summer-camp-schedule',
};

function resolvePageKey(rawPage) {
  const normalized = String(rawPage || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
  return PAGE_ALIASES[normalized] || normalized;
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.ADMIN_JWT_SECRET || 'valmiki-admin-secret',
    { expiresIn: '12h' }
  );

  return res.json({ token, username });
});

router.get('/validate', authRequired, (req, res) => {
  return res.json({ ok: true, admin: req.admin });
});

router.get('/content/:page', authRequired, async (req, res) => {
  const page = resolvePageKey(req.params.page);
  if (!ALLOWED_PAGES.has(page)) {
    return res.status(400).json({ message: 'Unsupported page' });
  }

  const row = await PageContent.findOne({ page }).lean();
  return res.json({ page, content: row?.content || {} });
});

router.put('/content/:page', authRequired, async (req, res) => {
  const page = resolvePageKey(req.params.page);
  if (!ALLOWED_PAGES.has(page)) {
    return res.status(400).json({ message: 'Unsupported page' });
  }

  const nextContent = req.body?.content || {};
  const row = await PageContent.findOneAndUpdate(
    { page },
    { content: nextContent, updatedBy: req.admin?.username || 'admin' },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  ).lean();

  req.app.get('io').emit('content:updated', { page, content: row.content });

  // Keep founders photos in About and Founders pages synchronized.
  // Last write wins (the page saved most recently becomes source of truth).
  if (page === 'about') {
    const foundersRow = await PageContent.findOne({ page: 'founders' }).lean();
    const syncedFoundersContent = {
      ...(foundersRow?.content || {}),
      ...(nextContent?.founderImage1 ? { rameshImage: nextContent.founderImage1 } : {}),
      ...(nextContent?.founderImage2 ? { swapnaImage: nextContent.founderImage2 } : {}),
    };

    const updatedFounders = await PageContent.findOneAndUpdate(
      { page: 'founders' },
      { content: syncedFoundersContent, updatedBy: req.admin?.username || 'admin' },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();

    req.app.get('io').emit('content:updated', {
      page: 'founders',
      content: updatedFounders.content,
    });
  }

  if (page === 'founders') {
    const aboutRow = await PageContent.findOne({ page: 'about' }).lean();
    const syncedAboutContent = {
      ...(aboutRow?.content || {}),
      ...(nextContent?.rameshImage ? { founderImage1: nextContent.rameshImage } : {}),
      ...(nextContent?.swapnaImage ? { founderImage2: nextContent.swapnaImage } : {}),
    };

    const updatedAbout = await PageContent.findOneAndUpdate(
      { page: 'about' },
      { content: syncedAboutContent, updatedBy: req.admin?.username || 'admin' },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();

    req.app.get('io').emit('content:updated', {
      page: 'about',
      content: updatedAbout.content,
    });
  }

  return res.json({ page, content: row.content });
});

router.post('/upload-image', authRequired, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: `Image too large. Maximum allowed size is ${MAX_UPLOAD_MB}MB.`,
        });
      }
      if (err) {
        return res.status(400).json({ message: err.message || 'Upload error' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const folder = req.body?.folder || 'misc';
      const uploaded = await uploadImage({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        folder,
      });

      const asset = await MediaAsset.create({
        folder,
        key: uploaded.key,
        url: uploaded.url,
        mimeType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
        uploadedBy: req.admin?.username || 'admin',
        meta: req.body?.meta ? JSON.parse(req.body.meta) : {},
      });

      req.app.get('io').emit('media:uploaded', asset);
      return res.status(201).json(asset);
    } catch (uploadError) {
      if (String(uploadError?.message || '').includes('Resolved credential object is not valid')) {
        return res.status(500).json({
          message:
            'Invalid DigitalOcean Space credentials. Check S3_ACCESS_KEY_ID and S3_ACCESS_KEY_SECRET in server/.env.',
        });
      }
      return res.status(uploadError?.status || 500).json({
        message: uploadError?.message || 'Unable to upload image',
      });
    }
  });
});

router.delete('/media/:id', authRequired, async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  await deleteImage(asset.key);
  await MediaAsset.deleteOne({ _id: asset._id });
  req.app.get('io').emit('media:deleted', { id: String(asset._id), key: asset.key, folder: asset.folder });
  return res.json({ ok: true });
});

router.get('/gallery-assets', authRequired, async (req, res) => {
  const assets = await MediaAsset.find({ folder: 'gallery' }).sort({ createdAt: -1 }).lean();
  return res.json({ items: assets });
});

router.get('/contests', authRequired, async (req, res) => {
  const items = await Contest.find({})
    .sort({ createdAt: -1 })
    .lean();

  const ids = items.map((item) => item._id);
  const counts = await ContestRegistration.aggregate([
    { $match: { contest: { $in: ids } } },
    { $group: { _id: '$contest', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
  const withCounts = items.map((item) => ({
    ...item,
    registrationCount: countMap.get(String(item._id)) || 0,
  }));

  return res.json({ items: withCounts });
});

router.get('/contests/:id', authRequired, async (req, res) => {
  const contest = await Contest.findById(req.params.id).lean();
  if (!contest) return res.status(404).json({ message: 'Contest not found' });
  return res.json({ contest });
});

router.post('/contests', authRequired, async (req, res) => {
  const body = req.body || {};
  const title = String(body.title || '').trim();
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const contest = await Contest.create({
    title,
    description: body.description || '',
    submitDate: body.submitDate || null,
    resultDate: body.resultDate || null,
    heroImages: Array.isArray(body.heroImages) ? body.heroImages : [],
    heroVideoLinks: Array.isArray(body.heroVideoLinks) ? body.heroVideoLinks : [],
    registerButtonText: body.registerButtonText || 'Register Now',
    registerMode: body.registerMode === 'google' ? 'google' : 'internal',
    googleFormUrl: body.googleFormUrl || '',
    sections: Array.isArray(body.sections) ? body.sections : [],
    isPublished: body.isPublished !== false,
    updatedBy: req.admin?.username || 'admin',
  });

  return res.status(201).json({ contest });
});

router.put('/contests/:id', authRequired, async (req, res) => {
  const body = req.body || {};
  const contest = await Contest.findById(req.params.id);
  if (!contest) return res.status(404).json({ message: 'Contest not found' });

  const nextTitle = String(body.title || contest.title).trim();
  if (!nextTitle) return res.status(400).json({ message: 'Title is required' });

  contest.title = nextTitle;
  contest.description = body.description || '';
  contest.submitDate = body.submitDate || null;
  contest.resultDate = body.resultDate || null;
  contest.heroImages = Array.isArray(body.heroImages) ? body.heroImages : [];
  contest.heroVideoLinks = Array.isArray(body.heroVideoLinks) ? body.heroVideoLinks : [];
  contest.registerButtonText = body.registerButtonText || 'Register Now';
  contest.registerMode = body.registerMode === 'google' ? 'google' : 'internal';
  contest.googleFormUrl = body.googleFormUrl || '';
  contest.sections = Array.isArray(body.sections) ? body.sections : [];
  contest.isPublished = body.isPublished !== false;
  contest.updatedBy = req.admin?.username || 'admin';
  await contest.save();

  return res.json({ contest });
});

router.get('/contests/:id/registrations', authRequired, async (req, res) => {
  const contest = await Contest.findById(req.params.id).lean();
  if (!contest) return res.status(404).json({ message: 'Contest not found' });

  const items = await ContestRegistration.find({ contest: contest._id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ contest: { id: contest._id, title: contest.title }, items });
});

module.exports = router;
