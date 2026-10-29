import api from './api';
export const getBeds = (params) => api.get('/beds', { params }).then((r) => r.data);
export const getBed = (id) => api.get(`/beds/${id}`).then((r) => r.data);
export const getBedStats = () => api.get('/beds/stats').then((r) => r.data);
export const createBed = (data) => api.post('/beds', data).then((r) => r.data);
export const updateBed = (id, data) => api.patch(`/beds/${id}`, data).then((r) => r.data);
export const deleteBed = (id) => api.delete(`/beds/${id}`).then((r) => r.data);
export const assignNursesToBed = (bedId, nurseIds) => api.patch(`/beds/${bedId}/assign-nurses`, { nurseIds }).then((r) => r.data);