import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
        {/* Logo */}
        <div
          className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight cursor-pointer"
          onClick={() => navigate('/user/dashboard')}
        >
          <div className="w-8 h-8 rounded-[6px] bg-indigo-600 shadow-sm flex items-center justify-center text-white text-sm font-bold select-none">
            AI
          </div>
          <span>TicketRoute</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 mt-0.5">{user?.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white uppercase select-none">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
