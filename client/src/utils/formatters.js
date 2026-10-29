export const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const fmtDateTime = (ts) =>
  new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const riskColor = (level) => ({
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  high: 'bg-red-500/20 text-red-400 border-red-500/40'
}[level] || 'bg-slate-500/20 text-slate-400 border-slate-500/40');
export const priorityColor = (p) => ({
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-slate-600 text-white'
}[p] || 'bg-slate-600 text-white');