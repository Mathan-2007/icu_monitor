const Alert = require('../models/Alert');
const { emitToRoom } = require('./notificationService');
const logger = require('../utils/logger');

// Every 30s: find critical alerts active > ESCALATION_TIMEOUT_MS → flag + notify doctors
exports.runEscalationSweep = () => {
  setInterval(async () => {
    try {
      const timeout = new Date(Date.now() - (+process.env.ESCALATION_TIMEOUT_MS || 120000));
      const stale = await Alert.find({
        status: 'active',
        priority: { $in: ['critical', 'high'] },
        escalated: false,
        createdAt: { $lt: timeout }
      }).populate('patient', 'name patientId');

      for (const alert of stale) {
        alert.escalated = true;
        alert.escalatedAt = new Date();
        await alert.save();
        emitToRoom('role:doctor', 'alert:escalated', alert);
        logger.warn(`⏫ Escalated: ${alert.type} (${alert.patient?.name})`);
      }
    } catch (e) { logger.error('escalation sweep:', e.message); }
  }, 30000);
  logger.info('⏫ Escalation service running (30s sweep)');
};