const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
  fromNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shift: { type: String, enum: ['morning', 'evening', 'night'] },
  notes: String,
  aiDraft: String,                          // AI-generated 8-hour vitals draft
  patientsCovered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }]
}, { timestamps: true });

module.exports = mongoose.model('ShiftHandover', handoverSchema);