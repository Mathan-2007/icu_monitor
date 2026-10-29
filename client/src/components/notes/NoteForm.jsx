// NoteForm.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { addNote } from '../../services/noteApi';

export default function NoteForm({ patientId }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try { await addNote(patientId, { content }); setContent(''); toast.success('Note added'); }
    catch { toast.error('Failed to add note'); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="flex gap-2 mb-4">
      <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add clinical note…"
        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
      <button disabled={busy} className="bg-blue-600 hover:bg-blue-500 px-4 rounded-lg text-sm disabled:opacity-50">Add</button>
    </form>
  );
}