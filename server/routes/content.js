const express = require('express');
const PageContent = require('../models/PageContent');
const MediaAsset = require('../models/MediaAsset');

const router = express.Router();

router.get('/gallery/assets/all', async (req, res) => {
  const items = await MediaAsset.find({ folder: 'gallery' }).sort({ createdAt: -1 }).lean();
  return res.json({ items });
});

router.get('/:page', async (req, res) => {
  const row = await PageContent.findOne({ page: req.params.page }).lean();
  return res.json({ page: req.params.page, content: row?.content || {} });
});

module.exports = router;
