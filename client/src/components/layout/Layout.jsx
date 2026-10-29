import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';

export default function Layout() {
  const { logout } = useAuthStore();
  const { subscribe, fetchAlerts } = useAlertStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribe();
    fetchAlerts({ status: 'active' });
    const refresh = setInterval(() => fetchAlerts({}), 30000);
    return () => { unsub(); clearInterval(refresh); };
  }, [fetchAlerts, subscribe]);

  return (
    <div className="app-shell flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid rgba(148,163,184,0.3)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)'
          }
        }}
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onLogout={() => { logout(); navigate('/login'); }} />
        <main className="flex-1 overflow-auto">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}