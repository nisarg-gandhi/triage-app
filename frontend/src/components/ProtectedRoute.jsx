import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
);

// Allows only role="user". Redirects admin/agent to /admin/dashboard.
export const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin' || user.role === 'agent') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

// Allows role="admin" or "agent". Redirects regular users to /user/dashboard.
export const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'user') {
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

// Legacy default export – kept for any existing usages during migration.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
