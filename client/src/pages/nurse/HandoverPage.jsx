import { useState } from 'react';
import toast from 'react-hot-toast';
import { createHandover } from '../../services/handoverApi';
import { useAuthStore } from '../../store/authStore';

export default function HandoverPage() {
  const { user } = useAuthStore();
  const [shift, setShift] = useState('night');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createHandover({ shift, notes, fromNurse: user._id });
      toast.success('Handover submitted');
      setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔄 Shift Handover</h1>
      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Shift</label>
          <select value={shift} onChange={(e) => setShift(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5">
            {['morning', 'evening', 'night'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-99 mb-1">Handover notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={7} required
            placeholder="Patient conditions, pending tasks, medication timing…"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5" />
        </div>
        <button disabled={busy}
          className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {busy ? 'Submitting…' : 'Submit Handover'}
        </button>
      </form>
    </div>
  );
}