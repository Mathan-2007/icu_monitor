// Use the below import if you want to use the react-sparklines library instead of recharts
//import { Sparklines, SparklinesLine } from 'react-sparklines';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

// tiny inline trend for patient cards
export default function MiniSparkline({ data, dataKey, color = '#38bdf8', height = 32 }) {
  if (!data?.length) return <div className="h-8" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}