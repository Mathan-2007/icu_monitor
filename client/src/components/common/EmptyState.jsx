export default function EmptyState({ title, subtitle, icon }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-8 py-14 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-2 max-w-md text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}