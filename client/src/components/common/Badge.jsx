export function Badge({ children, color = 'slate', pulse, clickable, onClick, className = '' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      onClick={clickable ? onClick : undefined}
      className={`status-pill border ${colors[color]} ${pulse ? 'animate-pulse' : ''} ${clickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}

export default Badge;