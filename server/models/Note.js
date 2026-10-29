const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: String,
  category: { type: String, enum: ['clinical', 'nursing', 'handover'], default: 'clinical' },
  content: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);