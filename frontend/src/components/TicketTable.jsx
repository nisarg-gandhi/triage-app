import { AlertCircle, Clock, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

const StatusBadge = ({ status }) => {
  const variants = {
    open: 'blue',
    in_progress: 'yellow',
    resolved: 'green',
    closed: 'gray'
  };

  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  const variant = variants[status?.toLowerCase()] || 'gray';
  const label = labels[status?.toLowerCase()] || status || 'Unknown';

  return <Badge label={label} variant={variant} />;
};

export default function TicketTable({ tickets, isLoading, error }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
        <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-red-200 shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2 text-lg">Failed to load tickets</p>
        <p className="text-sm text-red-500 max-w-md text-center">{error}</p>
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium text-lg mb-1">No tickets found</p>
        <p className="text-sm text-gray-500">There are no tickets matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Subject</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Urgency</th>
              <th className="px-6 py-4 font-semibold">Sentiment</th>
              <th className="px-6 py-4 font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {ticket.customer_name}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">{ticket.customer_email}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  <div className="truncate max-w-xs font-medium" title={ticket.subject}>
                    {ticket.subject}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4">
                  <Badge label={ticket.category} variant="indigo" />
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    label={ticket.urgency} 
                    variant={
                      ticket.urgency?.toLowerCase() === 'critical' ? 'red' :
                      ticket.urgency?.toLowerCase() === 'high' ? 'orange' : 
                      ticket.urgency?.toLowerCase() === 'medium' ? 'yellow' : 
                      ticket.urgency?.toLowerCase() === 'low' ? 'green' : 'gray'
                    } 
                  />
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    label={ticket.sentiment} 
                    variant={
                      ticket.sentiment?.toLowerCase() === 'positive' ? 'green' : 
                      ticket.sentiment?.toLowerCase() === 'negative' ? 'red' : 'gray'
                    } 
                  />
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
