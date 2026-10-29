module.exports = (err, req, res, next) => {
  console.error('❌', err.message);
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: msgs.join('. ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({ message: field ? `Duplicate value for ${field}` : 'A record with that value already exists' });
  }
  const status = err.statusCode || 500;
  res.status(status).json({ message: status >= 500 ? 'Server error' : (err.message || 'Request failed') });
};
