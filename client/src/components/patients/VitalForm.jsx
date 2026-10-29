// components/patients/VitalForm.jsx — reusable vitals entry (used by VitalsEntryPage)
import { useState } from 'react';

const FIELDS = [
  ['heartRate', 'Heart Rate (bpm)', 60, 100],
  ['systolic', 'Systolic', 90, 140],
  ['diastolic', 'Diastolic', 60, 90],
  ['spo2', 'SpO₂ (%)', 92, 100],
  ['temperature', 'Temperature (°C)', 36.1, 37.8],
  ['respiratoryRate', 'Resp. Rate', 12, 20]
];

export default function VitalForm({ onSubmit, busy }) {
  const [form, setForm] = useState({});
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); setForm({}); }} className="grid grid-cols-2 gap-4">
      {FIELDS.map(([key, label, min, max]) => (
        <div key={key}>
          <label className="text-xs text-slate-400">{label} <span className="text-slate-600">({min}–{max})</span></label>
          <input type="number" step="0.1" required value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-blue-500" />
        </div>
      ))}
      <button type="submit" disabled={busy}
        className="col-span-2 bg-blue-600 hover:bg-blue-500 rounded-lg py-2.5 font-semibold disabled:opacity-50">
        {busy ? 'Saving…' : 'Save Vitals'}
      </button>
    </form>
  );
}