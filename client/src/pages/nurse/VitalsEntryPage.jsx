import { useState } from 'react';
import toast from 'react-hot-toast';
import { addVitals } from '../../services/vitalApi';
import { usePatientStore } from '../../store/patientStore';
import { useEffect } from 'react';

const FIELDS = [
  ['heartRate', 'Heart Rate (bpm)', 60, 100],
  ['systolic', 'Systolic', 90, 140],
  ['diastolic', 'Diastolic', 60, 90],
  ['spo2', 'SpO₂ (%)', 92, 100],
  ['temperature', 'Temperature (°C)', 36.1, 37.8],
  ['respiratoryRate', 'Resp. Rate', 12, 20]
];

export default function VitalsEntryPage() {
  const patients = usePatientStore((s) => s.patients);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const submit = async (e) => {
    e.preventDefault();
    if (!patientId) return toast.error('Select a patient');
    setBusy(true);
    try {
      const { alerts } = await addVitals(patientId, form);
      toast.success(`Saved. ${alerts.length} alert(s) generated.`);
      setForm({});
    } catch { toast.error('Failed to save vitals'); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">❤️ Record Vitals</h1>
      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5">
          <option value="">Select patient…</option>
          {patients.filter((p) => p.status !== 'discharged').map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.patientId}) — Bed {p.icuBed?.bedNumber}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(([key, label, min, max]) => (
            <div key={key}>
              <label className="text-xs text-slate-400">{label} <span className="text-slate-600">(normal {min}–{max})</span></label>
              <input type="number" step="0.1" value={form[key] ?? ''} required
                onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>
        <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {busy ? 'Saving…' : 'Save Vitals'}
        </button>
      </form>
    </div>
  );
}
