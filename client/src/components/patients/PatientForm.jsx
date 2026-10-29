// components/patients/PatientForm.jsx
import { useState } from 'react';
import Loader from './../common/Loader';

export default function PatientForm({ 
  beds = [], 
  doctors = [], 
  onSubmit, 
  onCancel,
  loading = false,
  error = null 
}) {
  const [form, setForm] = useState({ 
    name: '', 
    age: '', 
    gender: 'male', 
    diagnosis: '', 
    medicalHistory: '', 
    icuBed: '', 
    assignedDoctor: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, age: +form.age });
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  // Filter beds that are available for assignment
  const availableBeds = beds.filter((b) => {
    const status = b.status || (b.isOccupied ? 'occupied' : 'available');
    return !b.currentPatient && ['available', 'reserved', 'cleaning'].includes(status);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Patient Name *</label>
        <input 
          required 
          value={form.name} 
          onChange={set('name')} 
          placeholder="Patient name"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Age *</label>
          <input 
            required 
            type="number" 
            value={form.age} 
            onChange={set('age')} 
            placeholder="Age"
            min="0" max="150"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
          <select 
            value={form.gender} 
            onChange={set('gender')}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['male', 'female', 'other'].map((g) => (
              <option key={g} value={g} className="text-slate-900">
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Diagnosis</label>
        <input 
          value={form.diagnosis} 
          onChange={set('diagnosis')} 
          placeholder="Diagnosis"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Medical History</label>
        <input 
          value={form.medicalHistory} 
          onChange={set('medicalHistory')} 
          placeholder="Medical history"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Bed *</label>
        <select 
          required 
          value={form.icuBed} 
          onChange={set('icuBed')}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || submitting}
        >
          <option value="" className="text-slate-400">Select bed…</option>
          {availableBeds.map((b) => (
            <option key={b._id} value={b._id} className="text-slate-900">
              {b.bedNumber} ({b.ward || 'ICU'}) - {b.status || 'available'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Assign Doctor</label>
        <select 
          value={form.assignedDoctor} 
          onChange={set('assignedDoctor')}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || submitting}
        >
          <option value="" className="text-slate-400">Assign doctor…</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id} className="text-slate-900">
              {d.name} {d.specialization ? `(${d.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="submit" 
          disabled={submitting || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg py-2.5 font-semibold text-sm text-white transition disabled:cursor-not-allowed"
        >
          {submitting ? <Loader inline /> : 'Admit'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={submitting || loading}
          className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-lg py-2.5 text-sm text-white transition disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}