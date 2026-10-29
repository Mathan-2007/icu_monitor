export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-blue-500"
    />
  );
}