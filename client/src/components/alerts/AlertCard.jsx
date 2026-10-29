import { timeAgo, priorityColor } from '../../utils/formatters';
import { canAckAlert, canResolveAlert } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function AlertCard({ alert, onAck, onResolve, userRole }) {
  const ack = async () => { try { await onAck(alert._id); toast.success('Acknowledged'); } catch { toast.error('Failed'); } };
  const res = async () => { try { await onResolve(alert._id); toast.success('Resolved'); } catch { toast.error('Failed'); } };

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${alert.status === 'active' && alert.priority === 'critical' ? 'border-red-200 bg-red-50/60' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${priorityColor(alert.priority)}`}>{alert.priority}</span>
            <span className="text-sm font-semibold text-slate-900">{alert.type}</span>
            {alert.escalated && <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">Escalated</span>}
          </div>
          <p className="mt-2 text-sm text-slate-700">{alert.message}</p>
          <p className="mt-2 text-xs text-slate-500">
            {alert.patient?.name} ({alert.patient?.patientId}) · {timeAgo(alert.createdAt)} · {alert.source === 'ai' ? 'AI generated' : 'Threshold alert'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {alert.status === 'active' && canAckAlert(userRole) && (
            <button onClick={ack} className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600">Acknowledge</button>
          )}
          {alert.status === 'acknowledged' && canResolveAlert(userRole) && (
            <button onClick={res} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500">Resolve</button>
          )}
          {alert.status === 'resolved' && <span className="text-xs font-semibold text-emerald-700">Resolved</span>}
        </div>
      </div>
    </div>
  );
}