const mongoose = require('mongoose');

// Admin-configurable thresholds (one doc per patient-type or global default)
const thresholdSchema = new mongoose.Schema({
  scope: { type: String, enum: ['global', 'patient'], default: 'global' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  heartRate: { min: { type: Number, default: 60 }, max: { type: Number, default: 100 } },
  spo2: { min: { type: Number, default: 92 }, max: { type: Number, default: 100 } },
  systolic: { min: { type: Number, default: 90 }, max: { type: Number, default: 140 } },
  diastolic: { min: { type: Number, default: 60 }, max: { type: Number, default: 90 } },
  temperature: { min: { type: Number, default: 36.1 }, max: { type: Number, default: 37.8 } },
  respiratoryRate: { min: { type: Number, default: 12 }, max: { type: Number, default: 20 } }
}, { timestamps: true });

module.exports = mongoose.model('Threshold', thresholdSchema);