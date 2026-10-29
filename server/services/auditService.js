const AuditLog = require('../models/AuditLog');

exports.log = async (req, action, resource, resourceId, details = '') => {
  try {
    await AuditLog.create({
      user: req.user?._id, userName: req.user?.name, role: req.user?.role,
      action, resource, resourceId: resourceId?.toString?.() || resourceId, details, ip: req.ip
    });
  } catch (e) { console.error('audit log failed:', e.message); }
};