import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ticketService from '../services/ticketService';
import Badge from '../components/Badge';
import { Plus, Inbox, AlertCircle, ChevronRight } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="h-3 bg-slate-100 rounded w-2/5" />
          <div className="h-5 bg-slate-100 rounded-full w-16" />
          <div className="h-5 bg-slate-100 rounded-full w-14" />
          <div className="h-5 bg-slate-100 rounded-full w-16" />
          <div className="h-3 bg-slate-100 rounded w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Status badge map ────────────────────────────────────────────────────────

const STATUS_VARIANT = {
  open: 'blue',
  in_progress: 'yellow',
  resolved: 'green',
  closed: 'gray',
};

const URGENCY_VARIANT = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'green',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketService.getTickets({});
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 pb-10">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here are your support tickets
          </p>
        </div>
        <button
          id="submit-new-ticket-btn"
          onClick={() => navigate('/user/new-ticket')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-md active:scale-95 transition-all duration-200 text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Submit New Ticket
        </button>
      </div>

      {/* ── Tickets Table Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Your Tickets
          </h2>
          {!isLoading && !error && tickets.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* States */}
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-1">Failed to load tickets</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
              <Inbox className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-slate-900 font-semibold text-base mb-1">No tickets yet</p>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              When you submit a support request, it will appear here so you can track its progress.
            </p>
            <Link
              to="/user/new-ticket"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Submit your first ticket
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ── Table ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3" aria-hidden="true" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    id={`ticket-row-${ticket.id}`}
                    onClick={() => navigate(`/user/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Subject */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors block max-w-xs truncate">
                        {ticket.subject}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.category ? (
                        <Badge label={ticket.category} variant="indigo" />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Urgency */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.urgency ? (
                        <Badge
                          label={ticket.urgency}
                          variant={URGENCY_VARIANT[ticket.urgency?.toLowerCase()] || 'gray'}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        label={ticket.status}
                        variant={STATUS_VARIANT[ticket.status?.toLowerCase()] || 'gray'}
                      />
                    </td>

                    {/* Date Submitted */}
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-4 text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
