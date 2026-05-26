import { useState, useEffect } from 'react';
import { Search, Bell, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function Navbar({ setMobileMenuOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetchWithAuth('/tickets/');
        if (!response.ok) return;
        const tickets = await response.json();
        
        const newNotifs = [];
        tickets.forEach(ticket => {
          if (ticket.status === 'open') {
            if (ticket.needs_review) {
              newNotifs.push({
                id: `review-${ticket.id}`,
                title: `Ticket needs review: ${ticket.subject}`,
                time: new Date(ticket.created_at),
                unread: true
              });
            }
            if (ticket.urgency === 'Critical') {
              newNotifs.push({
                id: `critical-${ticket.id}`,
                title: `Critical ticket: ${ticket.subject}`,
                time: new Date(ticket.created_at),
                unread: true
              });
            }
          }
        });
        
        newNotifs.sort((a, b) => b.time - a.time);
        
        const formatRelativeTime = (date) => {
          const now = new Date();
          const diffInSeconds = Math.floor((now - date) / 1000);
          if (diffInSeconds < 60) return 'just now';
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
          return `${Math.floor(diffInSeconds / 86400)} days ago`;
        };

        setNotifications(
          newNotifs.slice(0, 5).map(n => ({ ...n, time: formatRelativeTime(n.time) }))
        );
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/tickets?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleMarkAllRead = () => {
    setShowNotifications(false);
    setNotifications([]);
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1 max-w-2xl gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <form onSubmit={handleSearch} className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, customers, or articles..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm text-slate-900 placeholder-slate-500 shadow-sm"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {notifications.length > 0 && (
                  <span onClick={handleMarkAllRead} className="text-xs text-indigo-600 cursor-pointer hover:underline">Mark all as read</span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">You're all caught up</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer ${notif.unread ? 'bg-indigo-50/30' : ''}`}>
                      <p className={`text-sm ${notif.unread ? 'font-medium text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View all</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
