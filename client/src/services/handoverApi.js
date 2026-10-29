import api from './api';
export const getHandovers = () => api.get('/handovers').then((r) => r.data);
export const createHandover = (data) => api.post('/handovers', data).then((r) => r.data);