const rateLimit = require('express-rate-limit');

// Global API limiter: 300 requests / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  trustProxy: true,
  message: { message: 'Too many requests, try again later' }
});

// Stricter limiter for login (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  trustProxy: true,
  message: { message: 'Too many login attempts, try again in 10 minutes' }
});

module.exports = { apiLimiter, loginLimiter };