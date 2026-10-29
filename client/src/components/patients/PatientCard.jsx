import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { timeAgo, riskColor } from '../../utils/formatters';

const statusColor = { stable: 'green', serious: 'yellow', critical: 'red', discharged: 'slate' };

export default function PatientCard({ patient }) {
  const v = patient.latestVital || patient.vitalsSnapshot || {};

  return (
    <Link
      to={`/doctor/patients/${patient._id}`}
      className={`panel block p-4 transition hover:-translate-y-0.5 hover:border-blue-200 ${
        patient.status === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{patient.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {patient.patientId} · Bed {patient.icuBed?.bedNumber || '—'} · {patient.age}y {patient.gender?.[0]?.toUpperCase()}
          </p>
        </div>
        <Badge color={statusColor[patient.status]}>{patient.status}</Badge>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-base font-bold text-red-700">{v.heartRate ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">HR</div>
        </div>
        <div>
          <div className="text-base font-bold text-sky-700">{v.spo2 ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">SpO₂</div>
        </div>
        <div>
          <div className="text-base font-bold text-violet-700">{v.systolic ?? '—'}/{v.diastolic ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">BP</div>
        </div>
        <div>
          <div className="text-base font-bold text-amber-700">{v.temperature ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">°C</div>
        </div>
      </div>

      <div className={`rounded-lg border px-2 py-1.5 text-xs ${riskColor(patient.riskLevel)}`}>
        Risk {patient.riskScore?.toFixed?.(1) ?? patient.riskScore}/10 · {patient.diagnosis || 'No diagnosis'}
      </div>

      {patient.aiUpdatedAt && <p className="mt-2 text-[11px] text-slate-500">AI updated {timeAgo(patient.aiUpdatedAt)}</p>}
    </Link>
  );
}