const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { ADMIN_PASSWORD, ADMIN_USERNAME } = require('../config/admin');
const { authRequired } = require('../middleware/auth');
const PageContent = require('../models/PageContent');
const MediaAsset = require('../models/MediaAsset');
const { uploadImage, deleteImage } = require('../services/s3');

const router = express.Router();
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 25);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

const ALLOWED_PAGES = new Set(['home', 'about', 'founders', 'faq', 'gallery']);

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
  const page = req.params.page;
  if (!ALLOWED_PAGES.has(page)) {
    return res.status(400).json({ message: 'Unsupported page' });
  }

  const row = await PageContent.findOne({ page }).lean();
  return res.json({ page, content: row?.content || {} });
});

router.put('/content/:page', authRequired, async (req, res) => {
  const page = req.params.page;
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

module.exports = router;
