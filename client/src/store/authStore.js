import { create } from 'zustand';
import { login as loginApi } from '../services/authApi';
import { connectSocket, disconnectSocket } from '../services/socket';

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const clearStoredSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_snapshot');
  } catch {
    // Ignore storage exceptions in restricted browser modes.
  }
};

export const useAuthStore = create((set) => ({
  user: readStoredUser(),
  token: (() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginApi({ email, password });

      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_snapshot', JSON.stringify({ token, user }));
      } catch {
        // Ignore storage exceptions in restricted browser modes.
      }

      set({ token, user, loading: false });
      connectSocket();
      return user;
    } catch (e) {
      set({ error: e.response?.data?.message || 'Login failed', loading: false });
      throw e;
    }
  },

  logout: () => {
    clearStoredSession();
    disconnectSocket();
    set({ user: null, token: null, error: null });
  }
}));