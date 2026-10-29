import { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import BedGrid from '../../components/beds/BedGrid';
import { getStats } from '../../services/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const tick = () => getStats().then(setStats).catch(() => {});
    tick();
    const i = setInterval(tick, 10000); // live refresh
    return () => clearInterval(i);
  }, []);

  if (!stats) return <Loader label="Loading dashboard…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon="🧑‍🤝‍🧑" label="Total Patients" value={stats.totalPatients} tone="blue" />
        <StatCard icon="🏥" label="Active (ICU)" value={stats.activePatients} tone="green" />
        <StatCard icon="🚨" label="Critical" value={stats.criticalPatients} tone="red" />
        <StatCard icon="🛏️" label="Total Beds" value={stats.totalBeds} tone="blue" />
        <StatCard icon="⚡" label="Active Alerts" value={stats.activeAlerts} tone="yellow" />
        <StatCard icon="✅" label="Resolved Alerts" value={stats.resolvedAlerts} tone="green" />
      </div>
      <BedGrid />
    </div>
  );
}