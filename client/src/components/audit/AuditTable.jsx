import { fmtDateTime } from '../../utils/formatters';

export default function AuditTable({ logs }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-auto max-h-[75vh]">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400 sticky top-0 text-left"><tr>
          <th className="p-3">Time</th><th>User</th><th>Role</th><th>Action</th><th>Resource</th>
        </tr></thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id} className="border-t border-slate-700">
              <td className="p-3 text-slate-500 whitespace-nowrap">{fmtDateTime(l.createdAt)}</td>
              <td>{l.userName || l.user?.name || '—'}</td>
              <td className="text-slate-400">{l.role || '—'}</td>
              <td><code className="text-blue-400 text-xs">{l.action}</code></td>
              <td className="text-slate-400">{l.resource}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}