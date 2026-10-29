import api from './api';
export const analyzePatient = (patientId) => api.post(`/ai/analyze/${patientId}`).then((r) => r.data);
export const handoverDraft = (data) => api.post('/ai/handover-draft', data).then((r) => r.data);