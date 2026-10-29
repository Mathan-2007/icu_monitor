import api from './api';
export const getPatients = (params) => api.get('/patients', { params }).then((r) => r.data);
export const getPatient = (id) => api.get(`/patients/${id}`).then((r) => r.data);
export const admitPatient = (data) => api.post('/patients', data).then((r) => r.data);
export const updatePatient = (id, data) => api.patch(`/patients/${id}`, data).then((r) => r.data);
export const dischargePatient = (id) => api.patch(`/patients/${id}/discharge`).then((r) => r.data);