import { useEffect } from 'react';
import { getSocket } from '../services/socket';

// subscribe to socket events for the current component
export default function useSocket(events = {}) {
  useEffect(() => {
    const s = getSocket();
    const entries = Object.entries(events);
    entries.forEach(([ev, handler]) => s.on(ev, handler));
    return () => entries.forEach(([ev, handler]) => s.off(ev, handler));
  }, [events]);
}
