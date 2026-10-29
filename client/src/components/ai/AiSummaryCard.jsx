// AiSummaryCard.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { analyzePatient } from '../../services/aiApi';
import { timeAgo } from '../../utils/formatters';

export default function AiSummaryCard({ patient }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await analyzePatient(patient._id);
      toast.success('AI analysis updated');
      window.location.reload(); // simple refresh; refine later with store
    } catch (e) {
      toast.error(e.response?.data?.message || 'AI analysis failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600/15 to-slate-800 border border-indigo-500/30 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold flex items-center gap-2">🤖 AI Clinical Summary</h3>
        <button onClick={run} disabled={busy}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg disabled:opacity-50">
          {busy ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{patient.aiSummary || 'No AI analysis yet — click Re-analyze.'}</p>
      {patient.reasoning?.length ? (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1">Key factors:</p>
          <ul className="text-xs text-slate-400 list-disc pl-4 space-y-0.5">
            {patient.reasoning.slice(0, 5).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      ) : null}
      {patient.aiUpdatedAt && <p className="text-[10px] text-slate-600 mt-3">Updated {timeAgo(patient.aiUpdatedAt)}</p>}
      <p className="text-[10px] text-slate-600 mt-2 italic">Decision support only — does not replace clinical judgment.</p>
    </div>
  );
}