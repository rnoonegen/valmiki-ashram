const mongoose = require('mongoose');

/**
 * Older DBs may have a unique index on `slug` while the app never set slug,
 * causing only one contest with slug null — E11000 on the second insert.
 */
async function dropLegacyContestSlugIndex(db) {
  try {
    await db.collection('contests').dropIndex('slug_1');
    console.log('✅ Dropped legacy contests slug_1 index (optional cleanup).');
  } catch (error) {
    const code = error?.code;
    const msg = String(error?.message || '');
    if (code === 27 || msg.includes('index not found') || msg.includes('ns not found')) {
      return;
    }
    console.warn('⚠️ Could not drop contests slug_1 index:', msg);
  }
}

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB successfully.');
        await dropLegacyContestSlugIndex(mongoose.connection.db);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB.', error);
        process.exit(1);
    }
}

module.exports = connectMongoDB;