const { buildTrendSummary } = require('../services/summaryService');
const { buildPatientFilter, isBedAssignable, buildAlertDedupKey } = require('../services/patientWorkflow');

describe('patient summary generation', () => {
  it('summarizes a worsening trend', () => {
    const summary = buildTrendSummary([
      { heartRate: 78, spo2: 98, timestamp: Date.now() - 30 * 60000 },
      { heartRate: 104, spo2: 90, timestamp: Date.now() }
    ]);

    expect(summary).toContain('Heart rate');
    expect(summary.length).toBeGreaterThan(0);
  });
});

describe('patient workflow helpers', () => {
  it('rejects a bed already assigned to an active patient', () => {
    const bed = { isOccupied: true, status: 'occupied', currentPatient: 'patient-123' };
    expect(isBedAssignable(bed)).toBe(false);
  });

  it('builds a stable filter for patient search', () => {
    const filter = buildPatientFilter({
      status: 'critical',
      ward: 'ICU-A',
      search: 'Ravi',
      risk: 'high',
      page: 2,
      limit: 10,
      sortBy: 'riskScore'
    });

    expect(filter.filter.status).toBe('critical');
    expect(filter.filter.riskLevel).toBe('high');
    expect(filter.filter.$or).toBeTruthy();
    expect(filter.limit).toBe(10);
    expect(filter.skip).toBe(10);
  });

  it('creates a stable deduplication key for ongoing alerts', () => {
    const key = buildAlertDedupKey('P1001', 'heartRate', 'high');
    expect(key).toBe('P1001:heartRate:high');
  });
});