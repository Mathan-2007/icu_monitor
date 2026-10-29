// Auto-audits every write request (POST/PATCH/DELETE) on protected routes
const audit = require('../services/auditService');

module.exports = (req, res, next) => {
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method)) {
    audit.log(req, `${req.method} ${req.originalUrl}`, 'HTTP', req.params.id, JSON.stringify(req.body).slice(0, 200));
  }
  next();
};