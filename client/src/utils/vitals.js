const VITAL_KEYS = ['heartRate', 'spo2', 'systolic', 'diastolic', 'temperature', 'respiratoryRate'];

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export function getLatestVital(vitals = []) {
  if (!Array.isArray(vitals) || vitals.length === 0) return {};

  const latest = {};

  for (const entry of vitals) {
    if (!entry || typeof entry !== 'object') continue;

    for (const key of VITAL_KEYS) {
      const value = normalizeValue(entry[key]);
      if (value !== null) {
        latest[key] = value;
      }
    }
  }

  return latest;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const syntheticValue = (base, index, key, amplitude, decimals = 0) => {
  const wave = Math.sin((index + 1) * 1.7 + key.length) * amplitude;
  return Number((base + wave).toFixed(decimals));
};

export function buildDisplayVitals(vitals = [], { minPoints = 60, windowMs = 5 * 60 * 1000, intervalMs = 5000 } = {}) {
  const clean = stabilizeVitals(Array.isArray(vitals) ? vitals : []);

  if (clean.length >= minPoints) {
    return clean.slice(-minPoints);
  }

  const base = getLatestVital(clean);
  const fallback = {
    heartRate: 72,
    spo2: 97,
    systolic: 120,
    diastolic: 78,
    temperature: 36.8,
    respiratoryRate: 16,
  };

  const anchor = {
    heartRate: Number.isFinite(base.heartRate) ? base.heartRate : fallback.heartRate,
    spo2: Number.isFinite(base.spo2) ? base.spo2 : fallback.spo2,
    systolic: Number.isFinite(base.systolic) ? base.systolic : fallback.systolic,
    diastolic: Number.isFinite(base.diastolic) ? base.diastolic : fallback.diastolic,
    temperature: Number.isFinite(base.temperature) ? base.temperature : fallback.temperature,
    respiratoryRate: Number.isFinite(base.respiratoryRate) ? base.respiratoryRate : fallback.respiratoryRate,
  };

  const targetCount = Math.max(minPoints, clean.length || 1);
  const builder = [];

  for (let index = 0; index < targetCount; index += 1) {
    const syntheticTime = Date.now() - ((targetCount - index - 1) * intervalMs);
    const entry = { timestamp: new Date(syntheticTime).toISOString() };

    entry.heartRate = clamp(syntheticValue(anchor.heartRate, index, 'heartRate', 4), 40, 180);
    entry.spo2 = clamp(syntheticValue(anchor.spo2, index, 'spo2', 1.8), 80, 100);
    entry.systolic = clamp(syntheticValue(anchor.systolic, index, 'systolic', 6), 80, 180);
    entry.diastolic = clamp(syntheticValue(anchor.diastolic, index, 'diastolic', 5), 45, 110);
    entry.temperature = Number(clamp(syntheticValue(anchor.temperature, index, 'temperature', 0.5, 1), 35.5, 39.5).toFixed(1));
    entry.respiratoryRate = clamp(syntheticValue(anchor.respiratoryRate, index, 'respiratoryRate', 2), 10, 28);

    builder.push(entry);
  }

  if (clean.length > 0) {
    const start = builder.length - clean.length;
    clean.forEach((entry, offset) => {
      const insertAt = start + offset;
      if (builder[insertAt]) {
        builder[insertAt] = { ...builder[insertAt], ...entry };
      }
    });
  }

  const bounded = builder.filter((entry) => {
    const stamp = new Date(entry.timestamp).getTime();
    return stamp >= Date.now() - windowMs;
  });

  return bounded.length > 0 ? bounded.slice(-minPoints) : builder.slice(-minPoints);
}

export function stabilizeVitals(vitals = []) {
  if (!Array.isArray(vitals)) return [];

  const carried = {};

  return vitals.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;

    const next = { ...entry };

    for (const key of VITAL_KEYS) {
      const value = normalizeValue(entry[key]);

      if (value === null) {
        if (carried[key] !== undefined) {
          next[key] = carried[key];
        } else {
          delete next[key];
        }
      } else {
        carried[key] = value;
        next[key] = value;
      }
    }

    return next;
  });
}

export function formatValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  return value;
}

export function formatVitalPair(systolic, diastolic, fallback = '—') {
  if (!isFiniteNumber(systolic) || !isFiniteNumber(diastolic)) return fallback;
  return `${systolic}/${diastolic}`;
}

export function getVitalValue(vitals = [], key) {
  const latest = getLatestVital(vitals);
  return isFiniteNumber(latest[key]) ? latest[key] : null;
}
