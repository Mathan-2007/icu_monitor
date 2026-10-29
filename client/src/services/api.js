import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const getStoredValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const clearAuthSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_snapshot');
  } catch {
    // Ignore storage errors while resetting expired sessions.
  }

  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }
};

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000
});

api.interceptors.request.use((config) => {
  const token = getStoredValue('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuthSession();
    }

    if (!err.response) {
      console.warn('Network error or backend unavailable:', err.message);
      window.dispatchEvent(new CustomEvent('app:network-error', { detail: err.message }));
    }

    return Promise.reject(err);
  }
);

export default api;
