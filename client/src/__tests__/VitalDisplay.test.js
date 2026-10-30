import { describe, expect, it } from 'vitest';
import { buildDisplayVitals, getLatestVital, stabilizeVitals } from '../utils/vitals';

describe('vital display helpers', () => {
  it('keeps the last valid measurement when a reading is missing or incomplete', () => {
    const vitals = [
      { timestamp: 't1', heartRate: 74, spo2: 97, systolic: 120, diastolic: 78 },
      { timestamp: 't2', heartRate: undefined, spo2: 96, systolic: undefined, diastolic: 80 },
      { timestamp: 't3', heartRate: 72, spo2: undefined, systolic: 122, diastolic: undefined },
    ];

    expect(stabilizeVitals(vitals)).toEqual([
      { timestamp: 't1', heartRate: 74, spo2: 97, systolic: 120, diastolic: 78 },
      { timestamp: 't2', heartRate: 74, spo2: 96, systolic: 120, diastolic: 80 },
      { timestamp: 't3', heartRate: 72, spo2: 96, systolic: 122, diastolic: 80 },
    ]);

    expect(getLatestVital(vitals)).toMatchObject({
      heartRate: 72,
      spo2: 96,
      systolic: 122,
      diastolic: 80,
    });
  });

  it('builds a rolling 5 minute window so the chart never runs out of data', () => {
    const built = buildDisplayVitals([
      { timestamp: new Date(Date.now() - 20000).toISOString(), heartRate: 72, spo2: 97, systolic: 120, diastolic: 80, temperature: 36.7, respiratoryRate: 16 }
    ], { minPoints: 60, windowMs: 5 * 60 * 1000 });

    expect(built.length).toBeGreaterThanOrEqual(60);
    expect(built[0].heartRate).toBeDefined();
    expect(built[built.length - 1].heartRate).toBeGreaterThan(0);
  });
});
