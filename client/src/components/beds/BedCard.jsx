import Badge from '../common/Badge';

export default function BedCard({ bed }) {
  const p = bed.currentPatient;
  const status = bed.status || (p ? 'occupied' : 'available');
  
  const tone = status === 'occupied'
    ? p?.status === 'critical'
      ? 'border-red-200 bg-red-50/30'
      : p?.status === 'serious'
        ? 'border-amber-200 bg-amber-50/30'
        : 'border-emerald-200 bg-emerald-50/30'
    : status === 'cleaning'
      ? 'border-amber-200 bg-amber-50/30'
      : status === 'maintenance'
        ? 'border-slate-200 bg-slate-50'
        : status === 'unavailable'
          ? 'border-slate-300 bg-slate-100'
          : 'border-slate-200 bg-slate-50';

  const statusLabel = status === 'occupied' 
    ? (p?.status || 'occupied') 
    : status;

  const statusColor = status === 'occupied'
    ? (p?.status === 'critical' ? 'red' : p?.status === 'serious' ? 'yellow' : 'green')
    : status === 'cleaning' ? 'yellow' 
    : status === 'maintenance' ? 'slate'
    : status === 'unavailable' ? 'slate'
    : 'green';

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{bed.bedNumber}</span>
        <Badge color={statusColor}>
          {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
        </Badge>
      </div>

      {p ? (
        <>
          <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
          <p className="mt-1 text-xs text-slate-500">{p.patientId}</p>
          {p.riskLevel && (
            <p className="mt-1 text-xs text-slate-500">Risk: {p.riskLevel}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-slate-500">No patient assigned</p>
      )}
      
      {bed.ward && (
        <p className="mt-1 text-xs text-slate-400">Ward: {bed.ward}</p>
      )}
      
      {bed.room && (
        <p className="text-xs text-slate-400">Room: {bed.room}</p>
      )}
    </div>
  );
}