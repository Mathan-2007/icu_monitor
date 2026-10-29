// NoteList.jsx
import { useEffect, useState } from 'react';
import { getNotes } from '../../services/noteApi';
import { fmtDateTime } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function NoteList({ patientId }) {
  const [notes, setNotes] = useState([]);
  useEffect(() => { getNotes(patientId).then(setNotes).catch(() => {}); }, [patientId]);
  if (!notes.length) return <EmptyState icon="📝" title="No notes yet" />;
  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n._id} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="text-blue-400">{n.author?.name} ({n.authorRole})</span>
            <span>{fmtDateTime(n.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-200">{n.content}</p>
        </li>
      ))}
    </ul>
  );
}