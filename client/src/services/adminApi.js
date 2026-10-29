import api from './api';
export const getAuditLogs = () => api.get('/admin/audit-logs').then((r) => r.data);
export const getStats = () => api.get('/admin/stats').then((r) => r.data);