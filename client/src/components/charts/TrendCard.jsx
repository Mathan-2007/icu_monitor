import { useState } from 'react';
import toast from 'react-hot-toast';
import { analyzePatient } from '../../services/aiApi';

export default function SummaryRefreshButton({ patientId, onDone }) {
  const [busy, setBusy] = useState(false);
  return (
    <button onClick={async () => {
      setBusy(true);
      try { await analyzePatient(patientId); toast.success('AI analysis updated'); onDone?.(); }
      catch (e) { toast.error(e.response?.data?.message || 'AI failed'); }
      finally { setBusy(false); }
    }} disabled={busy}
      className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg disabled:opacity-50">
      {busy ? 'Analyzing…' : 'Re-analyze'}
    </button>
  );
}