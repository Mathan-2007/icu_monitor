import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const linksFor = (role) => ({
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/beds', label: 'Beds' },
    { to: '/admin/alerts', label: 'Alert Stats' },
    { to: '/admin/audit', label: 'Audit Logs' }
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', end: true },
    { to: '/doctor/patients', label: 'Patients' },
    { to: '/doctor/alerts', label: 'Alerts' }
  ],
  nurse: [
    { to: '/nurse', label: 'Dashboard', end: true },
    { to: '/nurse/my-beds', label: 'My Beds' },
    { to: '/nurse/vitals', label: 'Enter Vitals' },
    { to: '/nurse/alerts', label: 'Alerts' },
    { to: '/nurse/handover', label: 'Handover' }
  ]
}[role] || []);

export default function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-800 bg-[var(--sidebar)] text-slate-200">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-sm font-bold text-blue-200">
            ICU
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">ICU Monitor</div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Clinical ops</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {linksFor(user?.role).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Signed in</div>
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-slate-900/70 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
            <div className="text-xs capitalize text-blue-300">{user?.role || 'member'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}