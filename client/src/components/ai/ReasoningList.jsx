// ReasoningList.jsx
export default function ReasoningList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
      {items.map((r, i) => <li key={i}>{r}</li>)}
    </ul>
  );
}