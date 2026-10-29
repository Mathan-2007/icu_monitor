module.exports = {
  ROLES: ['admin', 'doctor', 'nurse', 'technician', 'viewer'],
  PATIENT_STATUS: ['stable', 'serious', 'critical', 'discharged'],
  PRIORITY: ['critical', 'high', 'medium', 'low'],
  ESCALATION_TIMEOUT_MS: +(process.env.ESCALATION_TIMEOUT_MS || 120000)
};