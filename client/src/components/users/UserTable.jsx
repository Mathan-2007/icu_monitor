// UserTable.jsx
import Badge from '../common/Badge';
export default function UserTable({ users, onDeactivate }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400 text-left"><tr>
          <th className="p-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t border-slate-700">
              <td className="p-3">{u.name}{u.specialization ? ` (${u.specialization})` : ''}</td>
              <td className="text-slate-400">{u.email}</td>
              <td><Badge color={u.role === 'admin' ? 'red' : u.role === 'doctor' ? 'blue' : 'green'}>{u.role}</Badge></td>
              <td><Badge color={u.isActive ? 'green' : 'slate'}>{u.isActive ? 'active' : 'disabled'}</Badge></td>
              <td className="p-3 text-right">
                {u.isActive && <button onClick={() => onDeactivate(u)} className="text-red-400 hover:text-red-300 text-xs">Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}