import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
    ...(user?.role === 'admin' || user?.role === 'agent' ? [{ icon: Users, label: 'Customers', path: '/customers' }] : []),
    ...(user?.role === 'admin' || user?.role === 'agent' ? [{ icon: BarChart3, label: 'Reports', path: '/reports' }] : [])
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <aside 
        className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-screen fixed md:sticky top-0 z-50 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${mobileMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {(!isCollapsed || mobileMenuOpen) && (
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight">
              <div className="w-8 h-8 rounded-[6px] bg-indigo-600 shadow-sm flex items-center justify-center text-white">
                AI
              </div>
              <span>TicketRoute</span>
            </div>
          )}
          {isCollapsed && !mobileMenuOpen && (
            <div className="w-8 h-8 mx-auto rounded-[6px] bg-indigo-600 shadow-sm flex items-center justify-center text-white font-bold">
              AI
            </div>
          )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm z-50"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-[6px] transition-all group ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isCollapsed && !mobileMenuOpen ? item.label : undefined}
                onClick={() => {
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'}`} />
                    {(!isCollapsed || mobileMenuOpen) && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {(!isCollapsed || mobileMenuOpen) && item.badge && (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 py-0.5 px-2 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer with Role Badge */}
      <div className="border-t border-slate-200 p-4">
        {(!isCollapsed || mobileMenuOpen) && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role || 'user'}</span>
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              user?.role === 'agent' ? 'bg-indigo-100 text-indigo-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {user?.role || 'user'}
            </span>
          </div>
        )}
      </div>

    </aside>
    </>
  );
}
