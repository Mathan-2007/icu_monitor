import api from './api';
export const getVitals = (patientId, limit = 100) => api.get(`/vitals/${patientId}?limit=${limit}`).then((r) => r.data);
export const addVitals = (patientId, data) => api.post(`/vitals/${patientId}`, data).then((r) => r.data);