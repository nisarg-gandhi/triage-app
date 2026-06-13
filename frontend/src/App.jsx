import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import Toast from './components/Toast';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PublicTicketSubmit from './pages/PublicTicketSubmit';

// Admin / Agent pages (existing, unchanged)
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

// Customer portal pages (new)
import UserDashboard from './pages/UserDashboard';
import UserNewTicket from './pages/UserNewTicket';
import UserTicketDetail from './pages/UserTicketDetail';

// Redirects authenticated users away from login/register based on their role
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'admin' || user.role === 'agent') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

// Root redirect: show landing page to guests, send authenticated users to their portal
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin' || user.role === 'agent') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/user/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <Routes>
          {/* Root → smart redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Public routes ───────────────────────────── */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          {/* Keep /signup as an alias so old bookmarks still work */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Public ticket submission — no auth guard, accessible by anyone */}
          <Route path="/submit-ticket" element={<PublicTicketSubmit />} />

          {/* ── Customer Portal: /user/* ─────────────────── */}
          <Route
            path="/user/*"
            element={
              <UserProtectedRoute>
                <UserLayout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="new-ticket" element={<UserNewTicket />} />
                    <Route path="tickets/:id" element={<UserTicketDetail />} />
                    {/* Fallback within /user */}
                    <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
                  </Routes>
                </UserLayout>
              </UserProtectedRoute>
            }
          />

          {/* ── Admin / Agent Dashboard: /admin/* ───────── */}
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="tickets" element={<Tickets />} />
                    <Route path="tickets/new" element={<NewTicket />} />
                    <Route path="tickets/:id" element={<TicketDetail />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="reports" element={<Reports />} />
                    {/* Fallback within /admin */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />

          {/* ── Legacy redirects (in case of old links) ── */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/tickets" element={<Navigate to="/admin/tickets" replace />} />

          {/* Global catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
