import api from './api';
export const getAlerts = (params) => api.get('/alerts', { params }).then((r) => r.data);
export const ackAlert = (id) => api.patch(`/alerts/${id}/ack`).then((r) => r.data);
export const resolveAlert = (id) => api.patch(`/alerts/${id}/resolve`).then((r) => r.data);