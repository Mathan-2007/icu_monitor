require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Vital = require('../models/Vital');
const Alert = require('../models/Alert');
const Threshold = require('../models/Threshold');
const AuditLog = require('../models/AuditLog');

const isConfirmed = process.argv.includes('--force') || process.argv.includes('--yes');

if (!isConfirmed) {
  console.error('Refusing to perform a destructive reset. Re-run with --force to confirm.');
  process.exit(1);
}

(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required before resetting the database.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('⚠️  Resetting demo data in the configured MongoDB database...');

  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Bed.deleteMany({}),
    Vital.deleteMany({}),
    Alert.deleteMany({}),
    Threshold.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log('✅ Destructive reset complete.');
  await mongoose.disconnect();
  process.exit(0);
})().catch((error) => {
  console.error('Reset failed:', error.message);
  process.exit(1);
});
