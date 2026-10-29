const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const {
  isBedAssignable,
  isBedOccupied,
  assignPatientToBed,
  releaseBed,
  transferPatient,
  getBedStats,
  createBed,
  updateBed,
  deleteBed
} = require('../services/bedService');
const ApiError = require('../utils/ApiError');

// Mock the models
vi.mock('../models/Bed');
vi.mock('../models/Patient');

describe('Bed Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Bed.findById = vi.fn();
    Patient.findById = vi.fn();
  });

  describe('isBedAssignable', () => {
    it('returns false for null bed', () => {
      expect(isBedAssignable(null)).toBe(false);
    });

    it('returns true for available bed with no patient', () => {
      const bed = { status: 'available', currentPatient: null };
      expect(isBedAssignable(bed)).toBe(true);
    });

    it('returns true for reserved bed with no patient', () => {
      const bed = { status: 'reserved', currentPatient: null };
      expect(isBedAssignable(bed)).toBe(true);
    });

    it('returns true for cleaning bed with no patient', () => {
      const bed = { status: 'cleaning', currentPatient: null };
      expect(isBedAssignable(bed)).toBe(true);
    });

    it('returns false for occupied bed', () => {
      const bed = { status: 'occupied', currentPatient: 'patient-1' };
      expect(isBedAssignable(bed)).toBe(false);
    });

    it('returns false for maintenance bed', () => {
      const bed = { status: 'maintenance', currentPatient: null };
      expect(isBedAssignable(bed)).toBe(false);
    });

    it('returns false for unavailable bed', () => {
      const bed = { status: 'unavailable', currentPatient: null };
      expect(isBedAssignable(bed)).toBe(false);
    });
  });

  describe('isBedOccupied', () => {
    it('returns false for null bed', () => {
      expect(isBedOccupied(null)).toBe(false);
    });

    it('returns true for bed with occupied status and patient', () => {
      const bed = { status: 'occupied', currentPatient: 'patient-1' };
      expect(isBedOccupied(bed)).toBe(true);
    });

    it('returns false for available bed', () => {
      const bed = { status: 'available', currentPatient: null };
      expect(isBedOccupied(bed)).toBe(false);
    });
  });

  describe('assignPatientToBed', () => {
    it('throws error if bed not found', async () => {
      Bed.findById.mockResolvedValue(null);
      await expect(assignPatientToBed('bed-1', 'patient-1')).rejects.toThrow(ApiError);
    });

    it('throws error if bed is not assignable', async () => {
      const bed = { status: 'occupied', currentPatient: 'other-patient' };
      Bed.findById.mockResolvedValue(bed);
      await expect(assignPatientToBed('bed-1', 'patient-1')).rejects.toThrow(ApiError);
    });

    it('throws error if patient not found', async () => {
      const bed = { status: 'available', currentPatient: null };
      Bed.findById.mockResolvedValue(bed);
      Patient.findById.mockResolvedValue(null);
      await expect(assignPatientToBed('bed-1', 'patient-1')).rejects.toThrow(ApiError);
    });

    it('assigns patient to bed successfully', async () => {
      const bed = {
        _id: 'bed-1',
        bedNumber: 'ICU-01',
        status: 'available',
        currentPatient: null
      };
      bed.save = vi.fn().mockResolvedValue({ ...bed, status: 'occupied', currentPatient: 'patient-1' });

      const patient = {
        _id: 'patient-1',
        icuBed: null
      };
      patient.save = vi.fn().mockResolvedValue({ ...patient, icuBed: 'bed-1' });

      Bed.findById.mockResolvedValue(bed);
      Patient.findById.mockResolvedValue(patient);

      const result = await assignPatientToBed('bed-1', 'patient-1');

      expect(bed.save).toHaveBeenCalled();
      expect(patient.save).toHaveBeenCalled();
      expect(result.bed.currentPatient).toBe('patient-1');
      expect(result.patient.icuBed).toBe('bed-1');
    });
  });

  describe('releaseBed', () => {
    it('throws error if bed not found', async () => {
      Bed.findById.mockResolvedValue(null);
      await expect(releaseBed('bed-1')).rejects.toThrow(ApiError);
    });

    it('throws error if bed has no patient', async () => {
      const bed = { status: 'available', currentPatient: null };
      Bed.findById.mockResolvedValue(bed);
      await expect(releaseBed('bed-1')).rejects.toThrow(ApiError);
    });

    it('releases bed successfully', async () => {
      const bed = {
        _id: 'bed-1',
        bedNumber: 'ICU-01',
        status: 'occupied',
        currentPatient: 'patient-1'
      };
      bed.save = vi.fn().mockResolvedValue({ ...bed, status: 'cleaning', currentPatient: null });

      Bed.findById.mockResolvedValue(bed);

      const result = await releaseBed('bed-1', 'cleaning');

      expect(bed.save).toHaveBeenCalled();
      expect(result.status).toBe('cleaning');
      expect(result.currentPatient).toBeNull();
    });
  });

  describe('transferPatient', () => {
    it('throws error if patient not found', async () => {
      Patient.findById.mockResolvedValue(null);
      await expect(transferPatient('patient-1', 'bed-1', 'bed-2', 'user-1')).rejects.toThrow(ApiError);
    });

    it('throws error if from bed not found', async () => {
      const patient = { _id: 'patient-1' };
      Patient.findById.mockResolvedValue(patient);
      Bed.findById.mockImplementation((id) => {
        if (id === 'bed-1') return null;
        if (id === 'bed-2') return { _id: 'bed-2', status: 'available', currentPatient: null };
      });
      await expect(transferPatient('patient-1', 'bed-1', 'bed-2', 'user-1')).rejects.toThrow(ApiError);
    });

    it('throws error if to bed not found', async () => {
      const patient = { _id: 'patient-1' };
      const fromBed = { _id: 'bed-1', status: 'occupied', currentPatient: 'patient-1' };
      Patient.findById.mockResolvedValue(patient);
      Bed.findById.mockImplementation((id) => {
        if (id === 'bed-1') return fromBed;
        if (id === 'bed-2') return null;
      });
      await expect(transferPatient('patient-1', 'bed-1', 'bed-2', 'user-1')).rejects.toThrow(ApiError);
    });

    it('transfers patient successfully', async () => {
      const patient = {
        _id: 'patient-1',
        icuBed: 'bed-1',
        transferHistory: []
      };
      patient.save = vi.fn().mockImplementation(() => Promise.resolve({
        ...patient,
        icuBed: 'bed-2',
        transferHistory: [{
          fromBed: 'bed-1',
          toBed: 'bed-2',
          transferredBy: 'user-1',
          transferredAt: expect.any(Date),
          reason: 'Bed transfer'
        }]
      }));

      const fromBed = {
        _id: 'bed-1',
        bedNumber: 'ICU-01',
        status: 'occupied',
        currentPatient: 'patient-1'
      };
      fromBed.save = vi.fn().mockResolvedValue({ ...fromBed, status: 'cleaning', currentPatient: null });

      const toBed = {
        _id: 'bed-2',
        bedNumber: 'ICU-02',
        status: 'available',
        currentPatient: null
      };
      toBed.save = vi.fn().mockResolvedValue({ ...toBed, status: 'occupied', currentPatient: 'patient-1' });

      Patient.findById.mockResolvedValue(patient);
      Bed.findById.mockImplementation((id) => {
        if (id === 'bed-1') return fromBed;
        if (id === 'bed-2') return toBed;
      });

      const result = await transferPatient('patient-1', 'bed-1', 'bed-2', 'user-1', 'Transfer test');

      expect(fromBed.save).toHaveBeenCalled();
      expect(toBed.save).toHaveBeenCalled();
      expect(patient.save).toHaveBeenCalled();
      expect(result.patient.icuBed).toBe('bed-2');
    });
  });
});

describe('Bed Controller Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Bed.findById = vi.fn();
    Patient.findById = vi.fn();
  });

  describe('getBedStats', () => {
    it('returns correct statistics', async () => {
      const mockBeds = [
        { status: 'occupied' },
        { status: 'occupied' },
        { status: 'available' },
        { status: 'cleaning' },
        { status: 'maintenance' },
        { status: 'unavailable' }
      ];

      Bed.countDocuments = vi.fn((query) => {
        if (!query) return Promise.resolve(6);
        if (query.status === 'occupied') return Promise.resolve(2);
        if (query.status === 'available') return Promise.resolve(1);
        if (query.status === 'cleaning') return Promise.resolve(1);
        if (query.status === 'maintenance') return Promise.resolve(1);
        if (query.status === 'unavailable') return Promise.resolve(1);
        return Promise.resolve(6);
      });

      const stats = await getBedStats();

      expect(stats.total).toBe(6);
      expect(stats.occupied).toBe(2);
      expect(stats.available).toBe(1);
      expect(stats.cleaning).toBe(1);
      expect(stats.maintenance).toBe(1);
      expect(stats.unavailable).toBe(1);
      expect(stats.occupancyRate).toBeCloseTo(33.3);
    });
  });
});
