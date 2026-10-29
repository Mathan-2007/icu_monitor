// src/pages/nurse/NurseDashboard.jsx
import { useEffect } from 'react';
import { usePatientStore } from '../../store/patientStore';
import PatientCard from '../../components/patients/PatientCard';
import Loader from '../../components/common/Loader';
import AlertFeed from '../../components/alerts/AlertFeed';
import { useAuthStore } from '../../store/authStore';

export default function NurseDashboard() {
  const patients = usePatientStore((s) => s.patients);
  const loading = usePatientStore((s) => s.loading);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const user = useAuthStore((s) => s.user);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  const mine = patients.filter((p) => p.assignedNurses?.some((n) => n._id === user?._id || n === user?._id));
  if (loading) return <Loader />;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <h1 className="text-2xl font-bold mb-4">My Patients ({mine.length})</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mine.map((p) => <PatientCard key={p._id} patient={p} />)}
        </div>
      </div>
      <aside>
        <h2 className="text-lg font-bold mb-3">🚨 Live Alerts</h2>
        <AlertFeed params={{ status: 'active' }} limit={30} />
      </aside>
    </div>
  );
}
