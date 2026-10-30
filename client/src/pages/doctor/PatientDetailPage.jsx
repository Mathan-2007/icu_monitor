import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePatientStore } from '../../store/patientStore';
import { getSocket } from '../../services/socket';
import VitalChart from '../../components/charts/VitalChart';
import RiskGauge from '../../components/charts/RiskGauge';
import AiSummaryCard from '../../components/ai/AiSummaryCard';
import AlertFeed from '../../components/alerts/AlertFeed';
import NoteForm from '../../components/notes/NoteForm';
import NoteList from '../../components/notes/NoteList';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import DischargeModal from '../../components/patients/DischargeModal';
import { useAuthStore } from '../../store/authStore';
import { canDischarge } from '../../utils/permissions';
import { buildDisplayVitals, getLatestVital, stabilizeVitals } from '../../utils/vitals';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { current, vitals, loading, error, fetchPatient, pushVital, clear, discharge } = usePatientStore();
  const { user } = useAuthStore();
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [discharging, setDischarging] = useState(false);

  const handleDischarge = useCallback(async () => {
    setDischarging(true);
    try {
      await discharge(id);
      toast.success('Patient discharged successfully');
      navigate('/doctor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to discharge patient');
    } finally {
      setDischarging(false);
      setDischargeOpen(false);
    }
  }, [id, discharge, navigate]);

  useEffect(() => {
    fetchPatient(id);
    const s = getSocket();
    s.emit('join:patient', id);
    const onVital = (v) => { if (String(v.patient?._id || v.patient || v.patientId) === String(id)) pushVital(id, v); };
    const onAiUpdate = () => fetchPatient(id);
    s.on('vitals:new', onVital);
    s.on('ai:update', onAiUpdate);
    return () => { s.emit('leave:patient', id); s.off('vitals:new', onVital); s.off('ai:update', onAiUpdate); clear(); };
  }, [id, fetchPatient, pushVital, clear]);

  if (!current && loading) return <Loader label="Loading patient…" />;
  if (!current) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error || 'Patient record unavailable.'}<button type="button" onClick={() => fetchPatient(id)} className="ml-3 font-semibold underline">Retry</button></div>;
  const p = current;
  const stableVitals = stabilizeVitals(buildDisplayVitals(vitals, { minPoints: 60, windowMs: 5 * 60 * 1000, intervalMs: 5000 }));
  const latest = getLatestVital(stableVitals);
  const bpValue = Number.isFinite(latest.systolic) && Number.isFinite(latest.diastolic) ? `${latest.systolic}/${latest.diastolic}` : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-white">← Back</button>
        {canDischarge(user?.role) && p.status !== 'discharged' && (
          <button onClick={() => setDischargeOpen(true)}
            className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg">Discharge</button>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">{p.name} <Badge color={p.status === 'critical' ? 'red' : p.status === 'serious' ? 'yellow' : 'green'}>{p.status}</Badge></h1>
          <p className="text-slate-400 text-sm mt-1">
            {p.patientId} · {p.age}y {p.gender} · Bed {p.icuBed?.bedNumber} · Dr. {p.assignedDoctor?.name}
          </p>
          <p className="text-slate-500 text-sm">Diagnosis: {p.diagnosis || '—'}</p>
          <p className="text-slate-500 text-sm">History: {p.medicalHistory || '—'}</p>
        </div>
        <RiskGauge score={p.riskScore} level={p.riskLevel} />
        <div className="grid grid-cols-5 gap-4 text-center">
          {[['❤️', latest.heartRate ?? '—', 'HR'], ['🫁', latest.spo2 ?? '—', 'SpO₂'], ['🩸', bpValue, 'BP'],
            ['🌡️', latest.temperature ?? '—', '°C'], ['😮‍💨', latest.respiratoryRate ?? '—', 'RR']].map(([icon, val, label], i) => (
            <div key={i}>
              <div className="text-2xl">{icon}</div>
              <div className="text-xl font-bold">{val ?? '—'}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">📈 Vitals Trend (last {stableVitals.length} readings)</h2>
            <VitalChart vitals={stableVitals} />
          </div>
          <AiSummaryCard patient={p} />
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">📝 Clinical Notes</h2>
            <NoteForm patientId={id} />
            <NoteList patientId={id} />
          </div>
        </div>
        <aside>
          <h2 className="font-semibold mb-3">🚨 Patient Alerts</h2>
          <AlertFeed params={{}} limit={20} />
        </aside>
      </div>

      <DischargeModal
        open={dischargeOpen}
        onClose={() => setDischargeOpen(false)}
        onConfirm={handleDischarge}
        patient={p}
      />
    </div>
  );
}
