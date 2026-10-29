import { io } from 'socket.io-client';

let socket = null;

const getSessionSnapshot = () => {
  try {
    const saved = localStorage.getItem('auth_snapshot');
    if (!saved) return { token: null, user: null };
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

export const getSocket = () => {
  if (!socket) socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: false });
  return socket;
};

export const connectSocket = () => {
  const { token, user } = getSessionSnapshot();
  if (!token || !user?.role) return null;

  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.on('connect', () => s.emit('join', { token, role: user.role }));
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};