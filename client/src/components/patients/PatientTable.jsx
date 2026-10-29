// components/patients/PatientTable.jsx — table alternative to cards
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { riskColor } from '../../utils/formatters';

export default function PatientTable({ patients, base = '/doctor/patients' }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400 text-left"><tr>
          <th className="p-3">Patient</th><th>Bed</th><th>Status</th><th>Risk</th><th>Doctor</th>
        </tr></thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id} className="border-t border-slate-700 hover:bg-slate-750 cursor-pointer">
              <td className="p-3"><Link to={`${base}/${p._id}`} className="hover:text-blue-400">{p.name}
                <span className="text-slate-600 text-xs ml-2">{p.patientId}</span></Link></td>
              <td>{p.icuBed?.bedNumber || '—'}</td>
              <td><Badge color={p.status === 'critical' ? 'red' : p.status === 'serious' ? 'yellow' : 'green'}>{p.status}</Badge></td>
              <td><span className={`px-2 py-0.5 rounded text-xs border ${riskColor(p.riskLevel)}`}>
                {p.riskScore?.toFixed?.(1) ?? p.riskScore}</span></td>
              <td className="text-slate-400">{p.assignedDoctor?.name || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}