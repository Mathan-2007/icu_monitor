const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const ApiError = require('../utils/ApiError');
const audit = require('./auditService');

/**
 * Valid bed statuses
 */
const VALID_BED_STATUSES = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'unavailable'];

/**
 * Check if a bed can be assigned to a patient
 * A bed is assignable if it's available, reserved, or in cleaning status
 * and has no current patient
 */
const isBedAssignable = (bed) => {
  if (!bed) return false;

  const status = String(bed.status || 'available').toLowerCase();
  const hasActivePatient = Boolean(bed.currentPatient || bed.isOccupied);

  return !hasActivePatient && ['available', 'reserved', 'cleaning'].includes(status);
};

/**
 * Check if a bed is currently occupied
 */
const isBedOccupied = (bed) => {
  if (!bed) return false;
  const status = String(bed.status || 'available').toLowerCase();
  return status === 'occupied' && Boolean(bed.currentPatient);
};

/**
 * Assign a patient to a bed
 */
const assignPatientToBed = async (bedId, patientId, userId = null) => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');
  if (!isBedAssignable(bed)) {
    throw new ApiError(400, `Bed ${bed.bedNumber} is not available for assignment (status: ${bed.status})`);
  }

  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  // Check if patient is already assigned to a bed
  if (patient.icuBed && patient.icuBed.toString() !== bedId.toString()) {
    throw new ApiError(400, 'Patient is already assigned to a different bed');
  }

  // Update the bed
  bed.currentPatient = patientId;
  bed.status = 'occupied';
  await bed.save();

  // Update the patient
  patient.icuBed = bedId;
  await patient.save();

  return { bed, patient };
};

/**
 * Release a bed (remove patient assignment)
 * This happens when a patient is discharged or transferred
 */
const releaseBed = async (bedId, nextStatus = 'cleaning') => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');

  if (!bed.currentPatient) {
    throw new ApiError(400, 'Bed has no assigned patient');
  }

  bed.currentPatient = null;
  bed.status = nextStatus;
  await bed.save();

  return bed;
};

/**
 * Transfer a patient from one bed to another
 */
const transferPatient = async (patientId, fromBedId, toBedId, userId, reason = '') => {
  const [patient, fromBed, toBed] = await Promise.all([
    Patient.findById(patientId),
    Bed.findById(fromBedId),
    Bed.findById(toBedId)
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!fromBed) throw new ApiError(404, 'Source bed not found');
  if (!toBed) throw new ApiError(404, 'Destination bed not found');

  if (!isBedOccupied(fromBed)) {
    throw new ApiError(400, 'Source bed is not currently occupied');
  }

  if (!isBedAssignable(toBed)) {
    throw new ApiError(400, `Destination bed ${toBed.bedNumber} is not available (status: ${toBed.status})`);
  }

  if (fromBed.currentPatient && fromBed.currentPatient.toString() !== patientId.toString()) {
    throw new ApiError(400, 'Source bed does not have this patient');
  }

  // Release the old bed
  fromBed.currentPatient = null;
  fromBed.status = 'cleaning';
  await fromBed.save();

  // Assign to new bed
  toBed.currentPatient = patientId;
  toBed.status = 'occupied';
  await toBed.save();

  // Update patient
  patient.icuBed = toBedId;
  
  // Add to transfer history
  patient.transferHistory = patient.transferHistory || [];
  patient.transferHistory.push({
    fromBed: fromBedId,
    toBed: toBedId,
    transferredBy: userId,
    transferredAt: new Date(),
    reason: reason || 'Bed transfer'
  });
  
  await patient.save();

  return { patient, fromBed, toBed };
};

/**
 * Get bed statistics
 */
const getBedStats = async () => {
  const [totalBeds, occupiedBeds, availableBeds, cleaningBeds, maintenanceBeds, unavailableBeds] = await Promise.all([
    Bed.countDocuments(),
    Bed.countDocuments({ status: 'occupied' }),
    Bed.countDocuments({ status: 'available' }),
    Bed.countDocuments({ status: 'cleaning' }),
    Bed.countDocuments({ status: 'maintenance' }),
    Bed.countDocuments({ status: 'unavailable' })
  ]);

  return {
    total: totalBeds,
    occupied: occupiedBeds,
    available: availableBeds,
    cleaning: cleaningBeds,
    maintenance: maintenanceBeds,
    unavailable: unavailableBeds,
    occupancyRate: totalBeds ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0
  };
};

/**
 * Check if a bed can be deleted (no active patient)
 */
const canDeleteBed = async (bedId) => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');
  return !isBedOccupied(bed);
};

/**
 * Assign nurses to a bed
 */
const assignNursesToBed = async (bedId, nurseIds, userId) => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');

  bed.assignedNurses = nurseIds;
  await bed.save();

  return bed;
};

/**
 * Get all beds with optional filtering
 */
const getBeds = async (filter = {}, options = {}) => {
  const query = {};
  
  if (filter.status) query.status = filter.status;
  if (filter.ward) query.ward = filter.ward;
  if (filter.room) query.room = filter.room;
  if (filter.occupied !== undefined) {
    query.status = filter.occupied ? 'occupied' : { $ne: 'occupied' };
  }
  
  return Bed.find(query)
    .populate('currentPatient', 'name patientId status riskLevel')
    .populate('assignedNurses', 'name')
    .sort(options.sort || { bedNumber: 1 })
    .skip(options.skip || 0)
    .limit(options.limit || 100);
};

/**
 * Get a single bed by ID with full population
 */
const getBedById = async (bedId) => {
  return Bed.findById(bedId)
    .populate('currentPatient', 'name patientId status riskLevel admittedAt')
    .populate('assignedNurses', 'name role');
};

/**
 * Create a new bed
 */
const createBed = async (bedData, userId) => {
  // Check for duplicate bed number
  const existing = await Bed.findOne({ bedNumber: bedData.bedNumber });
  if (existing) {
    throw new ApiError(409, `Bed number ${bedData.bedNumber} already exists`);
  }

  const bed = await Bed.create({
    bedNumber: bedData.bedNumber.trim(),
    ward: bedData.ward || 'ICU',
    room: bedData.room || null,
    status: bedData.status || 'available',
    notes: bedData.notes || null
  });

  return bed;
};

/**
 * Update a bed
 */
const updateBed = async (bedId, bedData, userId) => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');

  if (bedData.bedNumber && bedData.bedNumber !== bed.bedNumber) {
    // Check for duplicate
    const existing = await Bed.findOne({ bedNumber: bedData.bedNumber, _id: { $ne: bedId } });
    if (existing) {
      throw new ApiError(409, `Bed number ${bedData.bedNumber} already exists`);
    }
  }

  // Prevent status change if bed is occupied (except to maintenance/unavailable)
  if (bedData.status && isBedOccupied(bed)) {
    const allowedStatusesForOccupied = ['occupied', 'maintenance', 'unavailable'];
    if (!allowedStatusesForOccupied.includes(bedData.status)) {
      throw new ApiError(400, `Cannot change status of occupied bed to ${bedData.status}. Release patient first.`);
    }
  }

  // Build update object
  const update = {};
  if (bedData.bedNumber !== undefined) update.bedNumber = bedData.bedNumber.trim();
  if (bedData.ward !== undefined) update.ward = bedData.ward;
  if (bedData.room !== undefined) update.room = bedData.room;
  if (bedData.status !== undefined) update.status = bedData.status;
  if (bedData.notes !== undefined) update.notes = bedData.notes;

  const updatedBed = await Bed.findByIdAndUpdate(bedId, update, { new: true, runValidators: true });
  return updatedBed;
};

/**
 * Delete a bed
 */
const deleteBed = async (bedId, userId) => {
  const canDelete = await canDeleteBed(bedId);
  if (!canDelete) {
    throw new ApiError(400, 'Cannot delete bed with an active patient. Discharge or transfer the patient first.');
  }

  const bed = await Bed.findByIdAndDelete(bedId);
  return bed;
};

module.exports = {
  VALID_BED_STATUSES,
  isBedAssignable,
  isBedOccupied,
  assignPatientToBed,
  releaseBed,
  transferPatient,
  getBedStats,
  canDeleteBed,
  assignNursesToBed,
  getBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed
};
