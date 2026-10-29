import Badge from '../common/Badge';

export default function RiskGauge({ score = 0, level }) {
  // score 0-10 mapped to 0-180deg
  const angle = Math.min(score, 10) * 18;
  const color = level === 'high' ? '#ef4444' : level === 'medium' ? '#eab308' : '#22c55e';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        {/*半 gauge */}
        <div className="absolute inset-0 rounded-t-full border-[10px] border-slate-700 border-b-transparent" />
        <div
          className="absolute inset-0 rounded-t-full border-[10px] border-b-transparent transition-transform duration-700 origin-bottom"
          style={{
            borderTopColor: color,
            borderLeftColor: 'transparent',
            borderRightColor: color,
            transform: `rotate(${angle - 90}deg)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          }}
        />
        <div className="absolute inset-x-0 bottom-0 text-center pb-1">
          <span className="text-2xl font-bold" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-slate-500 text-xs">/10</span>
        </div>
      </div>
      <Badge color={level === 'high' ? 'red' : level === 'medium' ? 'yellow' : 'green'}>
        {level?.toUpperCase() || 'UNKNOWN'} RISK
      </Badge>
    </div>
  );
}