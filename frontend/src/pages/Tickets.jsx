import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ticketService from '../services/ticketService';
import TicketTable from '../components/TicketTable';
import SearchBar from '../components/SearchBar';
import TicketFilters from '../components/TicketFilters';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    urgency: ''
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch tickets from the backend with filters
        const data = await ticketService.getTickets(filters);
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [filters]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(prev => ({
      ...prev,
      status: '',
      category: '',
      urgency: ''
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and view all customer support tickets.</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </Link>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-start lg:items-center">
        <SearchBar 
          onSearch={handleSearch} 
          disabled={isLoading && tickets.length === 0} 
          initialValue={filters.search}
        />
        <TicketFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          disabled={isLoading && tickets.length === 0}
          onClear={handleClearFilters}
        />
      </div>

      {/* Main Table Content */}
      <TicketTable tickets={tickets} isLoading={isLoading} error={error} />
    </div>
  );
}
