import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ allowed, children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (allowed && !allowed.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}