const express = require('express');
const Curriculum = require('../models/Curriculum');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const doc = await Curriculum.findOne({ key: 'main' }).lean();
  return res.json({ categories: doc?.categories || [] });
});

router.get('/admin', authRequired, async (req, res) => {
  const doc = await Curriculum.findOne({ key: 'main' }).lean();
  return res.json({ categories: doc?.categories || [] });
});

router.put('/admin', authRequired, async (req, res) => {
  const categories = Array.isArray(req.body?.categories) ? req.body.categories : [];
  const row = await Curriculum.findOneAndUpdate(
    { key: 'main' },
    { categories, updatedBy: req.admin?.username || 'admin' },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  ).lean();

  req.app.get('io').emit('curriculum:updated', { categories: row.categories });
  return res.json({ categories: row.categories });
});

module.exports = router;
