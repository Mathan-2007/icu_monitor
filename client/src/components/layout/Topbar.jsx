import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { getNotificationSettings, requestNotificationPermission, setNotificationSettings } from '../../services/notifications';

export default function Topbar({ onLogout }) {
  const { user } = useAuthStore();
  const alerts = useAlertStore((s) => s.alerts);
  const [prefs, setPrefs] = useState(getNotificationSettings());
  const unread = alerts.filter((a) => a.status === 'active').length;
  const alertPath = user?.role === 'nurse' ? '/nurse/alerts' : user?.role === 'doctor' ? '/doctor/alerts' : '/admin/alerts';

  const updatePreference = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setNotificationSettings(next);

    if (patch.browser) {
      await requestNotificationPermission();
    }
  };

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white/95 px-6 backdrop-blur-sm">
      <div className="text-sm font-medium text-[var(--text-soft)]">
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-alt)] px-2 py-1.5 text-[11px] font-medium text-[var(--text-soft)] shadow-sm">
          <button
            type="button"
            onClick={() => updatePreference({ sound: !prefs.sound })}
            className={`rounded-full px-2.5 py-1.5 ${prefs.sound ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
            title="Toggle alert sound"
          >
            {prefs.sound ? 'Sound on' : 'Sound off'}
          </button>
          <button
            type="button"
            onClick={() => updatePreference({ browser: !prefs.browser })}
            className={`rounded-full px-2.5 py-1.5 ${prefs.browser ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}
            title="Toggle browser notifications"
          >
            {prefs.browser ? 'Browser alerts' : 'Browser muted'}
          </button>
        </div>

        <Link to={alertPath} className="relative inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel-alt)] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" title="Active alerts">
          Alerts
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>

        <button onClick={onLogout} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
          Logout
        </button>
      </div>
    </header>
  );
}