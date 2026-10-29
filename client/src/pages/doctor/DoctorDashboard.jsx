import { useEffect } from 'react';
import { usePatientStore } from '../../store/patientStore';
import { getSocket } from '../../services/socket';
import PatientCard from '../../components/patients/PatientCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import AlertFeed from '../../components/alerts/AlertFeed';

export default function DoctorDashboard() {
  const { patients, loading, fetchPatients, pushVital } = usePatientStore();

  useEffect(() => {
    fetchPatients();
    const s = getSocket();
    const onVital = ({ patientId, vital }) => pushVital(patientId, vital);
    s.on('vitals:new', onVital);
    return () => s.off('vitals:new', onVital);
  }, [fetchPatients, pushVital]);

  const critical = patients.filter((p) => p.status === 'critical');
  const serious = patients.filter((p) => p.status === 'serious');
  const stable = patients.filter((p) => p.status === 'stable');

  if (loading) return <Loader label="Loading patients…" />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {critical.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-red-400 mb-3">🚨 Critical ({critical.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {critical.map((p) => <PatientCard key={p._id} patient={p} />)}
            </div>
          </section>
        )}
        {serious.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Serious ({serious.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serious.map((p) => <PatientCard key={p._id} patient={p} />)}
            </div>
          </section>
        )}
        {stable.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-400 mb-3">✅ Stable ({stable.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stable.map((p) => <PatientCard key={p._id} patient={p} />)}
            </div>
          </section>
        )}
        {!patients.length && <EmptyState icon="🧑‍⚕️" title="No patients assigned" />}
      </div>

      <aside className="xl:col-span-1">
        <h2 className="text-lg font-bold mb-3">🚨 Live Alerts</h2>
        <AlertFeed params={{ status: 'active' }} limit={30} />
      </aside>
    </div>
  );
}
