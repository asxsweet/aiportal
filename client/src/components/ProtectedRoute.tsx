import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    const home = user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
