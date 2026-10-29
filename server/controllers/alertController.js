const Alert = require('../models/Alert');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const audit = require('../services/auditService');
const { emitToRoom } = require('../services/notificationService');

exports.getAlerts = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const alerts = await Alert.find(filter)
    .populate('patient', 'name patientId icuBed')
    .sort({ createdAt: -1 }).limit(200);
  res.json(alerts);
});

exports.acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { status: 'acknowledged', acknowledgedBy: req.user._id, acknowledgedAt: new Date() },
    { new: true }
  ).populate('patient', 'name patientId');
  if (!alert) throw new ApiError(404, 'Alert not found');
  audit.log(req, 'ACK_ALERT', 'Alert', alert._id);
  emitToRoom('role:doctor', 'alert:updated', alert);
  emitToRoom('role:nurse', 'alert:updated', alert);
  res.json(alert);
});

exports.resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved', resolvedBy: req.user._id, resolvedAt: new Date() },
    { new: true }
  ).populate('patient', 'name patientId');
  if (!alert) throw new ApiError(404, 'Alert not found');
  audit.log(req, 'RESOLVE_ALERT', 'Alert', alert._id);
  emitToRoom('role:doctor', 'alert:updated', alert);
  emitToRoom('role:nurse', 'alert:updated', alert);
  res.json(alert);
});