import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fmtTime } from '../../utils/formatters';

const SERIES = [
  { key: 'heartRate', label: 'Heart Rate', color: '#ef4444', unit: 'bpm' },
  { key: 'spo2', label: 'SpO₂', color: '#38bdf8', unit: '%' },
  { key: 'systolic', label: 'Systolic', color: '#a78bfa', unit: '' },
  { key: 'temperature', label: 'Temp', color: '#f59e0b', unit: '°C' },
  { key: 'respiratoryRate', label: 'RR', color: '#34d399', unit: '' }
];

export default function VitalChart({ vitals, series = ['heartRate', 'spo2', 'systolic'], height = 260 }) {
  const active = SERIES.filter((s) => series.includes(s.key));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={vitals} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={fmtTime} stroke="#64748b" fontSize={11} minTickGap={40} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelFormatter={fmtTime}
          formatter={(v, name) => [`${v}`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {active.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}