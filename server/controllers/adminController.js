const AuditLog = require('../models/AuditLog');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const Bed = require('../models/Bed');
const asyncHandler = require('../utils/asyncHandler');
const { getBedStats } = require('../services/bedService');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate('user', 'name role').sort({ createdAt: -1 }).limit(300);
  res.json(logs);
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalPatients,
    criticalPatients, 
    activePatients,
    bedStats,
    activeAlerts, 
    unacknowledgedAlerts, 
    resolvedAlerts
  ] = await Promise.all([
    Patient.countDocuments({ status: { $ne: 'discharged' } }),
    Patient.countDocuments({ status: 'critical' }),
    Patient.countDocuments({ status: { $ne: 'discharged' } }),
    getBedStats(),
    Alert.countDocuments({ status: 'active' }),
    Alert.countDocuments({ status: { $in: ['active', 'acknowledged'] } }),
    Alert.countDocuments({ status: 'resolved' })
  ]);

  res.json({
    totalPatients,
    criticalPatients,
    activePatients,
    totalBeds: bedStats.total,
    occupiedBeds: bedStats.occupied,
    availableBeds: bedStats.available,
    cleaningBeds: bedStats.cleaning,
    maintenanceBeds: bedStats.maintenance,
    unavailableBeds: bedStats.unavailable,
    occupancyRate: bedStats.occupancyRate,
    activeAlerts,
    unacknowledgedAlerts,
    resolvedAlerts
  });
});