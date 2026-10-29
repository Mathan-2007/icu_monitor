// UserForm.jsx
import { useState } from 'react';

const EMPTY = { name: '', email: '', password: '', role: 'nurse', specialization: '' };

export default function UserForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); setForm(EMPTY); }} className="space-y-3">
      <input required value={form.name} onChange={set('name')} placeholder="Full name"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
      <input required type="email" value={form.email} onChange={set('email')} placeholder="Email"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
      <input required type="password" value={form.password} onChange={set('password')} placeholder="Password"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
      <select value={form.role} onChange={set('role')}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm">
        {['nurse', 'doctor', 'admin'].map((r) => <option key={r}>{r}</option>)}
      </select>
      {form.role === 'doctor' && (
        <input value={form.specialization} onChange={set('specialization')} placeholder="Specialization"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
      )}
      <div className="flex gap-3">
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-lg py-2.5 font-semibold text-sm">Create</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-lg py-2.5 text-sm">Cancel</button>
      </div>
    </form>
  );
}