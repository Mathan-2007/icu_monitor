import { useEffect } from 'react';
import AlertCard from './AlertCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';

export default function AlertFeed({ params, limit = 50 }) {
  const alerts = useAlertStore((s) => s.alerts);
  const loading = useAlertStore((s) => s.loading);
  const error = useAlertStore((s) => s.error);
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts);
  const ackAlert = useAlertStore((s) => s.ackAlert);
  const resolveAlert = useAlertStore((s) => s.resolveAlert);
  const user = useAuthStore((s) => s.user);
  const paramsKey = JSON.stringify(params || {});

  useEffect(() => { fetchAlerts(JSON.parse(paramsKey)); }, [fetchAlerts, paramsKey]);

  if (loading && !alerts.length) return <Loader label="Loading alerts…" />;
  if (error && !alerts.length) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}<button type="button" onClick={() => fetchAlerts(JSON.parse(paramsKey))} className="ml-2 font-semibold underline">Retry</button></div>;
  if (!alerts.length) return <EmptyState title="No active alerts" subtitle="All clear for now." />;

  return (
    <div className="space-y-3">
      {alerts.slice(0, limit).map((a) => (
        <AlertCard key={a._id} alert={a} userRole={user?.role} onAck={ackAlert} onResolve={resolveAlert} />
      ))}
    </div>
  );
}
