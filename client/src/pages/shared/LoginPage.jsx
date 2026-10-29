import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { homeFor } from '../../constants/roles';

const DEMO = [
  { label: 'Admin', email: 'admin@icu.local', pass: 'admin123' },
  { label: 'Doctor', email: 'ravi@icu.local', pass: 'doctor123' },
  { label: 'Nurse', email: 'anu@icu.local', pass: 'nurse123' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}`);
      navigate(homeFor(user.role));
    } catch {
      // handled by store
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_38%,#edf2f7_100%)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700 shadow-sm">
            ICU
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ICU Monitor</h1>
          <p className="mt-2 text-sm text-slate-600">Clinical operations and patient monitoring dashboard</p>
        </div>

        <form onSubmit={submit} className="panel space-y-5 p-6 sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-shell"
              placeholder="you@icu.local"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-shell"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Demo accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.pass);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}