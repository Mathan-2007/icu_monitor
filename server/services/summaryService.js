// Template-based clinical summary (instant, no AI needed) —
// used for quick trend cards; Gemini gives the richer narrative.
const RANGES = require('../utils/vitalRanges');

exports.buildTrendSummary = (vitals) => {
  if (!vitals.length) return 'No vitals recorded yet.';
  const first = vitals[0], last = vitals[vitals.length - 1];
  const parts = [];
  const delta = (a, b, unit, goodDir) => {
    const d = b - a;
    if (Math.abs(d) < (unit === '°C' ? 0.3 : 2)) return null;
    const dir = d > 0 ? 'rising' : 'falling';
    return `${dir} ${Math.abs(d).toFixed(unit === '°C' ? 1 : 0)}${unit}${goodDir && ((d > 0) === goodDir) ? ' (worsening)' : ''}`;
  };
  const hr = delta(first.heartRate, last.heartRate, ' bpm');
  const sp = delta(first.spo2, last.spo2, '%');
  if (hr) parts.push(`Heart rate ${hr}`);
  if (sp) parts.push(`SpO₂ ${sp}`);
  if (!parts.length) return 'Vitals stable over the recent window.';
  return `Last ${Math.round((last.timestamp - first.timestamp) / 60000)} min: ${parts.join(', ')}.`;
};