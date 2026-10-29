import { useCallback, useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/adminApi';
import Loader from '../../components/common/Loader';
import { fmtDateTime } from '../../utils/formatters';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => getAuditLogs().then((result) => { setLogs(Array.isArray(result) ? result : []); setError(''); }).catch((err) => { setError(err.response?.data?.message || 'Unable to load audit logs'); }), []);
  useEffect(() => { load(); }, [load]);
  if (!logs && error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button type="button" onClick={load} className="ml-3 font-semibold underline">Retry</button></div>;
  if (!logs) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 Audit Logs</h1>
      {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" onClick={load} className="font-semibold underline">Retry</button></div>}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-auto max-h-[75vh]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 sticky top-0 text-left">
            <tr><th className="p-3">Time</th><th>User</th><th>Role</th><th>Action</th><th>Resource</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t border-slate-700">
                <td className="p-3 text-slate-500 whitespace-nowrap">{fmtDateTime(l.createdAt)}</td>
                <td>{l.userName || l.user?.name || '—'}</td>
                <td className="text-slate-400">{l.role || '—'}</td>
                <td><code className="text-blue-400 text-xs">{l.action}</code></td>
                <td className="text-slate-400">{l.resource} {l.resourceId ? `#${l.resourceId.slice(-6)}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
