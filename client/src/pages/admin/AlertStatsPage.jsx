// src/pages/admin/AlertStatsPage.jsx
import { useEffect, useState } from 'react';
import { getStats } from '../../services/adminApi';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
export default function AlertStatsPage() {
  const [s, setS] = useState(null);
  useEffect(() => { getStats().then(setS); }, []);
  if (!s) return <Loader />;
  return (<div>
    <h1 className="text-2xl font-bold mb-6">🚨 Alert Statistics</h1>
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <StatCard icon="⚡" label="Active" value={s.activeAlerts} tone="yellow" />
      <StatCard icon="✅" label="Resolved" value={s.resolvedAlerts} tone="green" />
    </div>
  </div>);
}