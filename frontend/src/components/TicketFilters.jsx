import { Filter, X } from 'lucide-react';

export default function TicketFilters({ filters, onFilterChange, disabled, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const hasActiveFilters = filters.status || filters.category || filters.urgency;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filters:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <select
          name="status"
          value={filters.status || ''}
          onChange={handleChange}
          disabled={disabled}
          className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white min-w-[120px]"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          name="urgency"
          value={filters.urgency || ''}
          onChange={handleChange}
          disabled={disabled}
          className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white min-w-[120px]"
        >
          <option value="">All Urgencies</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
          disabled={disabled}
          className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white min-w-[120px]"
        >
          <option value="">All Categories</option>
          <option value="Technical Support">Technical</option>
          <option value="Billing">Billing</option>
          <option value="Sales">Sales</option>
          <option value="General">General</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
