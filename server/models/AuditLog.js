const mongoose = require('mongoose');

module.exports = mongoose.model('AuditLog', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  role: String,
  action: { type: String, required: true },   // LOGIN, VIEW_PATIENT, ACK_ALERT, ADD_VITALS, DISCHARGE...
  resource: String,                            // "Patient", "Alert", "User"
  resourceId: String,
  details: String,
  ip: String
}, { timestamps: true }));