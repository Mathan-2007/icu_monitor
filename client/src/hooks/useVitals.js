import { useEffect, useState } from 'react';
import { getVitals } from '../services/vitalApi';
import { getSocket } from '../services/socket';

export default function useVitals(patientId) {
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    getVitals(patientId, 100).then(setVitals).catch(() => {});
    const s = getSocket();
    const handler = (v) => { if (v.patient === patientId || v.patientId === patientId) setVitals((old) => [...old, v].slice(-100)); };
    s.on('vitals:new', handler);
    return () => s.off('vitals:new', handler);
  }, [patientId]);

  return vitals;
}