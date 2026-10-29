import api from './api';
export const getNotes = (patientId) => api.get(`/notes/${patientId}`).then((r) => r.data);
export const addNote = (patientId, data) => api.post(`/notes/${patientId}`, data).then((r) => r.data);