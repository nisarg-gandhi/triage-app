import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCcw, CheckCircle2, Circle, Clock } from 'lucide-react';
import ticketService from '../services/ticketService';
import Badge from '../components/Badge';
import { formatDate } from '../utils/formatDate';

// formatDate is imported from src/utils/formatDate.js

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

const SENTIMENT_VARIANT = {
  positive: 'green',
  neutral: 'gray',
  negative: 'red',
};

// ─── Status Timeline ─────────────────────────────────────────────────────────

const STEPS = [
  { key: 'open', label: 'Ticket Submitted', description: 'Your ticket has been received.' },
  { key: 'in_progress', label: 'Under Review', description: 'Our team is looking into this.' },
  { key: 'resolved', label: 'Resolved', description: 'Your issue has been resolved.' },
];

function getStepIndex(status) {
  switch (status) {
    case 'open': return 0;
    case 'in_progress': return 1;
    case 'resolved': return 2;
    default: return 0;
  }
}

function StatusTimeline({ status }) {
  const activeIndex = getStepIndex(status);
  const isResolved = status === 'resolved';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
        Ticket Progress
      </h3>
      <ol className="relative space-y-0">
        {STEPS.map((step, idx) => {
          const isComplete = isResolved || idx < activeIndex;
          const isActive = idx === activeIndex && !isResolved;
          const isFuture = idx > activeIndex && !isResolved;

          return (
            <li key={step.key} className="flex gap-4">
              {/* Connector + Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors
                    ${isComplete || isResolved
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-300'}
                  `}
                >
                  {isComplete || isResolved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isActive ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {/* Vertical connector */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 my-1 min-h-[24px] rounded-full transition-colors ${
                      isComplete || isResolved ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Text */}
              <div className="pb-6 pt-1 min-w-0">
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isComplete || isResolved
                      ? 'text-emerald-700'
                      : isActive
                      ? 'text-indigo-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${isFuture ? 'text-slate-300' : 'text-slate-500'}`}>
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UserTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ticketService.getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    // Open a Server-Sent Events connection for real-time status updates.
    // EventSource cannot send custom headers, so we pass the JWT as a query param.
    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const sseUrl = `${apiBase}/tickets/${id}/stream?token=${token}`;
    const es = new EventSource(sseUrl);

    es.onmessage = (event) => {
      // Ignore heartbeat pings
      if (event.data === 'ping') return;
      try {
        const updated = JSON.parse(event.data);
        setTicket(updated);
      } catch {
        // Silently ignore malformed messages
      }
    };

    es.onerror = () => {
      // Browser will auto-reconnect; no need to handle manually
    };

    // Close the SSE connection when the component unmounts or the ticket id changes
    return () => es.close();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCcw className="w-9 h-9 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Loading ticket details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load ticket</h2>
        <p className="text-sm text-red-500 mb-6">{error}</p>
        <Link
          to="/user/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back button ── */}
      <button
        id="back-to-dashboard-btn"
        onClick={() => navigate('/user/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket header card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
                  {ticket.subject}
                </h1>
                <Badge
                  label={ticket.status}
                  variant={STATUS_VARIANT[ticket.status?.toLowerCase()] || 'gray'}
                />
              </div>
              <p className="text-sm text-slate-400">
                Submitted on {formatDate(ticket.created_at)}
              </p>
            </div>

            {/* Message */}
            <div className="p-6 bg-slate-50/60">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Your Message
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm min-h-[140px]">
                {ticket.message}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar column ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status timeline */}
          <StatusTimeline status={ticket.status} />

          {/* AI Analysis card — simplified for customers */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
              AI Analysis
            </h3>
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">Category</span>
                <Badge label={ticket.category} variant="indigo" />
              </div>

              {/* Urgency */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">Urgency</span>
                <Badge
                  label={ticket.urgency}
                  variant={URGENCY_VARIANT[ticket.urgency?.toLowerCase()] || 'gray'}
                />
              </div>

              {/* Sentiment */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">Sentiment</span>
                <Badge
                  label={ticket.sentiment}
                  variant={SENTIMENT_VARIANT[ticket.sentiment?.toLowerCase()] || 'gray'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
