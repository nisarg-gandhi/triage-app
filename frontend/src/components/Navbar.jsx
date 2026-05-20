import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const mockNotifications = [
    { id: 1, title: 'New ticket created', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Ticket classified as high urgency', time: '1 hour ago', unread: true },
    { id: 3, title: 'Ticket #1023 resolved', time: '3 hours ago', unread: false },
  ];
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, customers, or articles..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm text-gray-900 placeholder-gray-500"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-indigo-50/30' : ''}`}>
                    <p className={`text-sm ${notif.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View all</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">Jane Doe</p>
            <p className="text-xs text-gray-500 mt-1">Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white">
            JD
          </div>
        </button>
      </div>
    </header>
  );
}
