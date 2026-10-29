const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  heartRate: { type: Number, min: 20, max: 250 },
  systolic: { type: Number, min: 40, max: 250 },
  diastolic: { type: Number, min: 20, max: 200 },
  spo2: { type: Number, min: 40, max: 100 },
  temperature: { type: Number, min: 30, max: 45 },      // Celsius
  respiratoryRate: { type: Number, min: 4, max: 60 },
  source: { type: String, enum: ['device', 'manual', 'simulator'], default: 'manual' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Compound index: "latest vitals for patient X" queries stay fast
vitalSchema.index({ patient: 1, timestamp: -1 });

module.exports = mongoose.model('Vital', vitalSchema);