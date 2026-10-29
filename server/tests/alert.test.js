const { scoreVitals } = require('../services/riskService');
const Alert = require('../models/Alert');
const { checkVitals } = require('../services/alertEngine');

describe('alert risk scoring', () => {
  beforeEach(() => {
    Alert.findOne = vi.fn();
    Alert.create = vi.fn();
  });

  it('marks high-risk vitals as critical', () => {
    const result = scoreVitals({
      heartRate: 132,
      systolic: 72,
      diastolic: 50,
      spo2: 86,
      temperature: 39.4,
      respiratoryRate: 30
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(6);
    expect(result.riskLevel).toBe('high');
  });

  it('does not create duplicate active alerts for the same patient and threshold', async () => {
    const existingAlert = {
      _id: 'existing-alert',
      patient: '507f1f77bcf86cd799439011',
      type: 'Abnormal Heart Rate',
      status: 'active',
      save: vi.fn().mockResolvedValue(true)
    };

    Alert.findOne.mockResolvedValue(existingAlert);

    const patient = { _id: '507f1f77bcf86cd799439011', name: 'Test Patient' };
    const vital = {
      heartRate: 130,
      systolic: 118,
      diastolic: 76,
      spo2: 96,
      temperature: 37.1,
      respiratoryRate: 18,
      toObject: () => ({ heartRate: 130, systolic: 118, diastolic: 76, spo2: 96, temperature: 37.1, respiratoryRate: 18 })
    };

    const alerts = await checkVitals(patient, vital);

    expect(Alert.findOne).toHaveBeenCalled();
    expect(Alert.create).not.toHaveBeenCalled();
    expect(alerts).toHaveLength(1);
    expect(existingAlert.message).toBe('Heart Rate high: 130 (max 100)');
  });
});