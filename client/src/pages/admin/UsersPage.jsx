import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deactivateUser } from '../../services/userApi';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';

const EMPTY = { name: '', email: '', password: '', role: 'nurse', specialization: '', phone: '' };
const fieldClass = 'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getUsers();
      setUsers(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load users. Check your connection and retry.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    getUsers().then((result) => {
      if (active) setUsers(Array.isArray(result) ? result : []);
    }).catch((err) => {
      if (active) setError(err.response?.data?.message || 'Unable to load users. Check your connection and retry.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleUsers = useMemo(() => users.filter((user) => {
    const searchMatch = `${user.name || ''} ${user.email || ''}`.toLowerCase().includes(query.trim().toLowerCase());
    return searchMatch && (role === 'all' || user.role === role) && (status === 'all' || (status === 'active' ? user.isActive === true : user.isActive === false));
  }).sort((a, b) => {
    const left = String(a[sort.field] ?? '').toLowerCase();
    const right = String(b[sort.field] ?? '').toLowerCase();
    return left.localeCompare(right) * (sort.direction === 'asc' ? 1 : -1);
  }), [users, query, role, status, sort]);

  const toggleSort = (field) => setSort((current) => ({ field, direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc' }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'nurse', specialization: user.specialization || '', phone: user.phone || '', password: '' });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role, specialization: form.specialization.trim(), phone: form.phone.trim() };
      if (!editing) payload.password = form.password;
      if (editing) await updateUser(editing._id, payload);
      else await createUser(payload);
      toast.success(editing ? 'User updated' : 'User created');
      setOpen(false); setEditing(null); setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || (editing ? 'Failed to update user' : 'Failed to create user'));
    } finally { setSaving(false); }
  };

  const changeStatus = async () => {
    if (!confirming) return;
    const user = confirming;
    setSaving(true);
    try {
      if (user.isActive) await deactivateUser(user._id);
      else await updateUser(user._id, { isActive: true });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      setConfirming(null);
      await load();
    } catch (err) { toast.error(err.response?.data?.message || 'Unable to update account status'); }
    finally { setSaving(false); }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">User Management</h1><p className="mt-1 text-sm text-slate-600">Manage staff access and account status.</p></div>
        <button type="button" onClick={openCreate} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">+ Add User</button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
        <label className="min-w-56 flex-1"><span className="sr-only">Search users</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className={fieldClass} /></label>
        <label><span className="sr-only">Filter by role</span><select value={role} onChange={(e) => setRole(e.target.value)} className={fieldClass}><option value="all">All roles</option>{['admin', 'doctor', 'nurse'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">Filter by status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <button type="button" onClick={load} disabled={loading} className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      {loading && users.length === 0 ? <Loader /> : error ? <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><button type="button" onClick={load} className="mt-3 font-semibold underline">Retry</button></div> : visibleUsers.length === 0 ? <EmptyState title={users.length ? 'No matching users' : 'No users yet'} subtitle={users.length ? 'Adjust your search or filters.' : 'Add a staff account to get started.'} /> : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-100">
            <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-300"><tr>{[['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['isActive', 'Status']].map(([field, label]) => <th key={field} scope="col" aria-sort={sort.field === field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className="p-4"><button type="button" onClick={() => toggleSort(field)} className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">{label}{sort.field === field ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}</button></th>)}<th scope="col" className="p-4 text-right">Actions</th></tr></thead>
            <tbody>{visibleUsers.map((u) => <tr key={u._id} className="border-t border-slate-700 hover:bg-slate-700/60">
              <td className="p-4 font-medium text-slate-50">{u.name || '—'}{u.specialization ? <span className="block text-xs font-normal text-slate-300">{u.specialization}</span> : null}</td>
              <td className="p-4 text-slate-200">{u.email || '—'}</td>
              <td className="p-4"><Badge color={u.role === 'admin' ? 'red' : u.role === 'doctor' ? 'blue' : 'green'}>{u.role || 'Unknown'}</Badge></td>
              <td className="p-4"><Badge color={u.isActive === true ? 'green' : 'slate'}>{u.isActive === true ? 'Active' : u.isActive === false ? 'Inactive' : 'Unknown'}</Badge></td>
              <td className="space-x-3 p-4 text-right"><button type="button" onClick={() => openEdit(u)} className="font-medium text-blue-300 hover:text-blue-200">Edit</button>{String(currentUser?._id) !== String(u._id) && typeof u.isActive === 'boolean' && <button type="button" onClick={() => setConfirming(u)} className={u.isActive ? 'font-medium text-red-300 hover:text-red-200' : 'font-medium text-emerald-300 hover:text-emerald-200'}>{u.isActive ? 'Deactivate' : 'Activate'}</button>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => !saving && setOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">Full name<input autoFocus required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="block text-sm font-medium text-slate-200">Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${fieldClass} mt-1`} /></label>
          {!editing && <label className="block text-sm font-medium text-slate-200">Temporary password<input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${fieldClass} mt-1`} /><span className="mt-1 block text-xs text-slate-400">At least 8 characters.</span></label>}
          <label className="block text-sm font-medium text-slate-200">Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${fieldClass} mt-1`}>{['admin', 'doctor', 'nurse'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          {form.role === 'doctor' && <label className="block text-sm font-medium text-slate-200">Specialization<input maxLength={100} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={`${fieldClass} mt-1`} /></label>}
          <label className="block text-sm font-medium text-slate-200">Phone (optional)<input type="tel" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${fieldClass} mt-1`} /></label>
          <div className="flex justify-end gap-3 pt-2"><button type="button" disabled={saving} onClick={() => setOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create user'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(confirming)} onClose={() => !saving && setConfirming(null)} onConfirm={changeStatus} title={confirming?.isActive ? 'Deactivate user?' : 'Activate user?'} message={confirming?.isActive ? `Disable sign-in for ${confirming?.name}?` : `Restore sign-in for ${confirming?.name}?`} confirmLabel={confirming?.isActive ? 'Deactivate' : 'Activate'} danger={confirming?.isActive} busy={saving} />
    </section>
  );
}
