export default function StatCard({ icon, label, value, tone = 'blue', sub }) {
  const tones = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'bg-blue-100' },
    red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'bg-red-100' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-100' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100' }
  };

  const config = tones[tone] || tones.blue;

  return (
    <div className={`metric-card ${config.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`metric-icon ${config.icon} ${config.text}`}>{icon || label.slice(0, 1).toUpperCase()}</div>
        {sub && <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{sub}</span>}
      </div>
      <div className={`metric-value mt-4 ${config.text}`}>{value}</div>
      <div className="metric-label mt-1">{label}</div>
    </div>
  );
}