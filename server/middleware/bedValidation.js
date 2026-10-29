const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const ApiError = require('../utils/ApiError');
const { isBedAssignable, isBedOccupied } = require('../services/bedService');

/**
 * Middleware to validate bed assignment and prevent conflicts
 */

/**
 * Validate that a bed can be assigned to a patient
 */
exports.validateBedAssignment = async (req, res, next) => {
  try {
    const { icuBed, patientId } = req.body;
    
    if (!icuBed) return next(); // No bed assignment in this request
    
    const bed = await Bed.findById(icuBed);
    if (!bed) throw new ApiError(400, 'Invalid bed ID');
    
    if (!isBedAssignable(bed)) {
      throw new ApiError(400, `Bed ${bed.bedNumber} is not available for assignment (status: ${bed.status})`);
    }
    
    // Check if patient is already assigned to a different bed
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (patient && patient.icuBed && patient.icuBed.toString() !== icuBed.toString()) {
        throw new ApiError(400, 'Patient is already assigned to a different bed. Transfer required.');
      }
    }
    
    // Check for concurrent assignment (race condition protection)
    // Re-fetch the bed to ensure it hasn't changed since we first checked
    const freshBed = await Bed.findById(icuBed);
    if (!isBedAssignable(freshBed)) {
      throw new ApiError(409, `Bed ${bed.bedNumber} was just assigned to another patient. Please refresh and try again.`);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate that a bed can be released (has a patient)
 */
exports.validateBedRelease = async (req, res, next) => {
  try {
    const { bedId } = req.params;
    const bed = await Bed.findById(bedId);
    
    if (!bed) throw new ApiError(404, 'Bed not found');
    
    if (!isBedOccupied(bed)) {
      throw new ApiError(400, `Bed ${bed.bedNumber} has no patient to release`);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate bed deletion (no active patient)
 */
exports.validateBedDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bed = await Bed.findById(id);
    
    if (!bed) throw new ApiError(404, 'Bed not found');
    
    if (isBedOccupied(bed)) {
      throw new ApiError(400, `Cannot delete bed ${bed.bedNumber} with an active patient. Discharge or transfer the patient first.`);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate bed update (prevent invalid status changes)
 */
exports.validateBedUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) return next(); // No status change
    
    const bed = await Bed.findById(id);
    if (!bed) throw new ApiError(404, 'Bed not found');
    
    if (isBedOccupied(bed)) {
      const allowedStatusesForOccupied = ['occupied', 'maintenance', 'unavailable'];
      if (!allowedStatusesForOccupied.includes(status)) {
        throw new ApiError(400, `Cannot change status of occupied bed to ${status}. Release patient first.`);
      }
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate that a patient can be discharged (has a bed assigned)
 */
exports.validatePatientDischarge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    
    if (!patient) throw new ApiError(404, 'Patient not found');
    
    if (patient.status === 'discharged') {
      throw new ApiError(400, 'Patient is already discharged');
    }
    
    // Discharge is allowed even without a bed (edge case)
    // but we should still proceed with the discharge
    
    next();
  } catch (err) {
    next(err);
  }
};
