const Vital = require('../models/Vital');
const Patient = require('../models/Patient');
const { checkVitals } = require('../services/alertEngine');
const { emitToRoom } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.addVitals = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const vital = await Vital.create({ ...req.body, patient: patient._id, source: 'manual', recordedBy: req.user._id });

  emitToRoom(`patient:${patient._id}`, 'vitals:new', vital);
  const alerts = await checkVitals(patient, vital);
  alerts.forEach(a => {
    emitToRoom('role:doctor', 'alert:new', a);
    emitToRoom('role:nurse', 'alert:new', a);
  });

  res.status(201).json({ vital, alerts });
});

exports.getVitals = asyncHandler(async (req, res) => {
  const limit = +req.query.limit || 100;
  const vitals = await Vital.find({ patient: req.params.patientId })
    .sort({ timestamp: -1 }).limit(limit).populate('recordedBy', 'name');
  res.json(vitals.reverse());
});