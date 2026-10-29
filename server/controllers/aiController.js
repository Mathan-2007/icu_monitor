const asyncHandler = require('../utils/asyncHandler');
const { analyzePatient } = require('../services/aiService');
const { emitToRoom } = require('../services/notificationService');
const audit = require('../services/auditService');

exports.analyzePatient = asyncHandler(async (req, res) => {
  const result = await analyzePatient(req.params.patientId);
  audit.log(req, 'AI_ANALYZE', 'Patient', req.params.patientId);
  emitToRoom(`patient:${req.params.patientId}`, 'ai:update', result);
  emitToRoom('role:doctor', 'ai:update', { patientId: req.params.patientId, ...result });
  res.json(result);
});

exports.aiHandoverDraft = asyncHandler(async (req, res) => {
  // Placeholder for shift-handover AI draft — implemented with handover feature
  res.json({ draft: 'Handover AI draft coming with handover module' });
});