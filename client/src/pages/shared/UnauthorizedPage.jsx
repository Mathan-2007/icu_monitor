import { Link } from 'react-router-dom';
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-slate-400">Your role doesn't have permission to view this page.</p>
      <Link to="/login" className="text-blue-400 hover:underline">Back to login</Link>
    </div>
  );
}