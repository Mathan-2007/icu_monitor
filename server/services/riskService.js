const RANGES = require('../utils/vitalRanges');

// Simple weighted scoring — used as fallback when Gemini is unavailable,
// and to update risk instantly on every new vital reading.
exports.scoreVitals = (v) => {
  let score = 0;
  const dev = (val, r) => {
    if (val == null) return 0;
    if (val > r.max) return Math.min((val - r.max) / ((r.max - r.min) || 1) * 5, 3);
    if (val < r.min) return Math.min((r.min - val) / ((r.max - r.min) || 1) * 5, 3);
    return 0;
  };
  score += dev(v.heartRate, RANGES.heartRate) * 1.2;
  score += dev(v.systolic, RANGES.systolic);
  score += dev(v.diastolic, RANGES.diastolic);
  score += dev(v.spo2, RANGES.spo2) * 1.5;       // hypoxia weighs most
  score += dev(v.temperature, RANGES.temperature);
  score += dev(v.respiratoryRate, RANGES.respiratoryRate);
  const normalized = Math.min(Math.round(score * 1.6 * 10) / 10, 10);
  const level = normalized >= 6 ? 'high' : normalized >= 3 ? 'medium' : 'low';
  return { riskScore: normalized, riskLevel: level };
};