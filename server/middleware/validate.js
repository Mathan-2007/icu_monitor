// Minimal validation middleware: pass required fields for the route's body
module.exports.validateBody = (...fields) => (req, res, next) => {
  const missing = fields.filter((f) => req.body?.[f] === undefined || req.body?.[f] === '');
  if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  next();
};