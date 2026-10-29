const DEFAULT_LIMIT = 25;

const validPatientStatuses = ['stable', 'serious', 'critical', 'discharged', 'transferred'];
const validBedStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'unavailable'];

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const normalizeArray = (value) => {
  if (!value) return [];
  return Array.isArray(value)
    ? value.map((item) => sanitizeText(item)).filter(Boolean)
    : [sanitizeText(value)].filter(Boolean);
};

const generatePatientIdentifier = () => `P-${Date.now().toString().slice(-8)}`;

const normalizePatientPayload = (input = {}, { isUpdate = false } = {}) => {
  const payload = { ...input };

  if (payload.name) payload.name = sanitizeText(payload.name);
  if (payload.patientId) payload.patientId = sanitizeText(payload.patientId).toUpperCase();
  if (!payload.patientId && !isUpdate) payload.patientId = generatePatientIdentifier();

  if (payload.age !== undefined && payload.age !== null) {
    const age = Number(payload.age);
    if (Number.isNaN(age) || age < 0 || age > 150) {
      throw new Error('Patient age must be a realistic number between 0 and 150.');
    }
    payload.age = age;
  }

  if (payload.gender) {
    const gender = payload.gender.toLowerCase();
    if (!['male', 'female', 'other'].includes(gender)) {
      throw new Error('Gender must be male, female, or other.');
    }
    payload.gender = gender;
  }

  if (payload.status && !validPatientStatuses.includes(payload.status)) {
    throw new Error(`Unsupported patient status: ${payload.status}`);
  }

  if (payload.riskLevel && !['low', 'medium', 'high'].includes(payload.riskLevel)) {
    throw new Error(`Unsupported risk level: ${payload.riskLevel}`);
  }

  if (payload.ward) payload.ward = sanitizeText(payload.ward);
  if (payload.room) payload.room = sanitizeText(payload.room);
  if (payload.diagnosis) payload.diagnosis = sanitizeText(payload.diagnosis);
  if (payload.admissionReason) payload.admissionReason = sanitizeText(payload.admissionReason);
  if (payload.medicalHistory) payload.medicalHistory = sanitizeText(payload.medicalHistory);
  if (payload.carePlan) payload.carePlan = sanitizeText(payload.carePlan);
  if (payload.allergies) payload.allergies = normalizeArray(payload.allergies);
  if (payload.currentMedications) payload.currentMedications = normalizeArray(payload.currentMedications);

  if (payload.riskScore !== undefined && payload.riskScore !== null) {
    const riskScore = Number(payload.riskScore);
    if (Number.isNaN(riskScore) || riskScore < 0 || riskScore > 10) {
      throw new Error('Risk score must be between 0 and 10.');
    }
    payload.riskScore = riskScore;
  }

  return payload;
};

const buildPatientFilter = ({
  status,
  search,
  doctor,
  ward,
  risk,
  page = 1,
  limit = DEFAULT_LIMIT,
  sortBy = 'admittedAt'
} = {}) => {
  const filter = {};

  if (status) filter.status = status;
  if (doctor) filter.assignedDoctor = doctor;
  if (ward) filter.ward = ward;
  if (risk) filter.riskLevel = risk;

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { patientId: new RegExp(search, 'i') },
      { diagnosis: new RegExp(search, 'i') },
      { medicalHistory: new RegExp(search, 'i') }
    ];
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, 100));
  const safePage = Math.max(1, Number(page) || 1);
  const sort = sortBy === 'riskScore'
    ? { riskScore: -1, admittedAt: -1 }
    : { admittedAt: -1, createdAt: -1 };

  return {
    filter,
    sort,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    page: safePage
  };
};

const isBedAssignable = (bed) => {
  if (!bed) return false;

  const status = String(bed.status || (bed.isOccupied ? 'occupied' : 'available')).toLowerCase();
  const hasActivePatient = Boolean(bed.currentPatient || bed.isOccupied);

  return !hasActivePatient && ['available', 'reserved', 'cleaning'].includes(status);
};

const buildAlertDedupKey = (patientId, type, priority = 'medium') => {
  const normalizedPatientId = String(patientId || '').trim();
  const normalizedType = String(type || '').trim().replace(/\s+/g, '');
  const normalizedPriority = String(priority || 'medium').trim().toLowerCase();

  if (!normalizedPatientId || !normalizedType) {
    return 'invalid-alert';
  }

  return `${normalizedPatientId}:${normalizedType}:${normalizedPriority}`;
};

module.exports = {
  DEFAULT_LIMIT,
  validPatientStatuses,
  validBedStatuses,
  normalizePatientPayload,
  buildPatientFilter,
  isBedAssignable,
  buildAlertDedupKey,
  generatePatientIdentifier
};
