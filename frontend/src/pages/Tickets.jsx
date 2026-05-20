import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import ticketService from '../services/ticketService';
import TicketTable from '../components/TicketTable';
import SearchBar from '../components/SearchBar';
import TicketFilters from '../components/TicketFilters';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    urgency: searchParams.get('urgency') || ''
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketService.getTickets(filters);
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [filters.search, filters.status, filters.category, filters.urgency]);

  const updateSearchParams = useCallback((newFilters) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      let changed = false;
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          if (updated.get(key) !== value) {
            updated.set(key, value);
            changed = true;
          }
        } else {
          if (updated.has(key)) {
            updated.delete(key);
            changed = true;
          }
        }
      });
      
      return changed ? updated : prev;
    }, { replace: true });
  }, [setSearchParams]);

  const handleSearch = useCallback((searchTerm) => {
    updateSearchParams({ search: searchTerm });
  }, [updateSearchParams]);

  const handleFilterChange = useCallback((newFilters) => {
    updateSearchParams(newFilters);
  }, [updateSearchParams]);

  const handleClearFilters = useCallback(() => {
    updateSearchParams({ status: '', category: '', urgency: '' });
  }, [updateSearchParams]);

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);

      const url = `http://localhost:8000/tickets/export?${queryParams.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to export tickets');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'tickets_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export tickets. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and view all customer support tickets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </Link>
        </div>
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
