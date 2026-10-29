const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, min: 0, max: 150 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  admissionReason: { type: String, trim: true },
  diagnosis: { type: String, trim: true },
  medicalHistory: { type: String, trim: true },
  allergies: [{ type: String, trim: true }],
  currentMedications: [{ type: String, trim: true }],
  ward: { type: String, trim: true, default: 'ICU' },
  room: { type: String, trim: true },
  icuBed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendingPhysician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['stable', 'serious', 'critical', 'discharged', 'transferred'], 
    default: 'stable' 
  },
  readmissionCount: { type: Number, default: 0 },
  previousAdmissions: [{
    date: Date,
    ward: String,
    bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' }
  }],
  carePlan: { type: String, trim: true },
  dischargeSummary: { type: String, trim: true },

  // AI fields (updated by aiService)
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  riskScore: { type: Number, default: 0, min: 0, max: 10 },
  aiSummary: String,
  aiReasoning: [String],
  aiUpdatedAt: Date,

  admittedAt: { type: Date, default: Date.now },
  dischargedAt: Date,
  transferHistory: [{
    fromBed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
    toBed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
    transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferredAt: { type: Date, default: Date.now },
    reason: String
  }]
}, { timestamps: true });

patientSchema.index({ ward: 1, status: 1, riskLevel: 1, admittedAt: -1 });
patientSchema.index({ name: 'text', patientId: 'text', diagnosis: 'text', medicalHistory: 'text' });

module.exports = mongoose.model('Patient', patientSchema);