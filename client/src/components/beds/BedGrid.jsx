import { useEffect, useState, useCallback } from 'react';
import { getBeds, getBedStats } from '../../services/bedApi';
import { getSocket } from '../../services/socket';
import BedCard from './BedCard';
import StatCard from '../common/StatCard';
import Loader from '../common/Loader';
import Badge from '../common/Badge';

export default function BedGrid({ showStats = true, showFilter = false }) {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [bedsData, statsData] = await Promise.all([
        getBeds({ status: filter !== 'all' ? filter : undefined }),
        getBedStats()
      ]);
      setBeds(Array.isArray(bedsData) ? bedsData : bedsData.items || []);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load beds');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
    const s = getSocket();
    s.on('vitals:new', load);
    return () => s.off('vitals:new', load);
  }, [load]);

  const filteredBeds = filter === 'all' ? beds : beds.filter(b => b.status === filter);

  if (loading && !beds.length) return <Loader label="Loading beds..." />;

  return (
    <div className="space-y-4">
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon="🛏️" label="Total Beds" value={stats.total} tone="blue" />
          <StatCard icon="🟢" label="Available" value={stats.available} tone="emerald" />
          <StatCard icon="🔴" label="Occupied" value={stats.occupied} tone="red" />
          <StatCard icon="🧹" label="Cleaning" value={stats.cleaning} tone="amber" />
          <StatCard icon="🔧" label="Maintenance" value={stats.maintenance} tone="slate" />
          <StatCard icon="❌" label="Unavailable" value={stats.unavailable} tone="slate" />
        </div>
      )}

      {showFilter && (
        <div className="flex flex-wrap gap-2">
          <Badge 
            color={filter === 'all' ? 'blue' : 'slate'} 
            onClick={() => setFilter('all')}
            clickable
          >
            All ({beds.length})
          </Badge>
          <Badge 
            color={filter === 'available' ? 'emerald' : 'slate'} 
            onClick={() => setFilter('available')}
            clickable
          >
            Available ({stats?.available || 0})
          </Badge>
          <Badge 
            color={filter === 'occupied' ? 'red' : 'slate'} 
            onClick={() => setFilter('occupied')}
            clickable
          >
            Occupied ({stats?.occupied || 0})
          </Badge>
          <Badge 
            color={filter === 'cleaning' ? 'amber' : 'slate'} 
            onClick={() => setFilter('cleaning')}
            clickable
          >
            Cleaning ({stats?.cleaning || 0})
          </Badge>
          <Badge 
            color={filter === 'maintenance' ? 'slate' : 'slate'} 
            onClick={() => setFilter('maintenance')}
            clickable
          >
            Maintenance ({stats?.maintenance || 0})
          </Badge>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
          <button onClick={load} className="ml-3 font-semibold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {filteredBeds.map((b) => (
          <BedCard key={b._id} bed={b} />
        ))}
      </div>
    </div>
  );
}