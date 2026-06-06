import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, User, Mail, AlertCircle, RefreshCcw,
  CheckCircle, Sparkles, UserCheck, ChevronDown, UserPlus,
  ThumbsUp, ThumbsDown, Send,
} from 'lucide-react';
import ticketService from '../services/ticketService';
import agentService from '../services/agentService';
import feedbackService from '../services/feedbackService';
import TicketMetadata from '../components/TicketMetadata';
import DraftResponseBox from '../components/DraftResponseBox';
import Badge from '../components/Badge';
import StatusActions from '../components/StatusActions';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatDate';

// ─── Assignment reason badge ──────────────────────────────────────────────────

function AssignmentReasonBadge({ reason }) {
  if (!reason) return null;
  const map = {
    ai_suggested: { label: 'AI Suggested', variant: 'indigo' },
    manual: { label: 'Manual', variant: 'gray' },
    reassigned: { label: 'Reassigned', variant: 'yellow' },
  };
  const { label, variant } = map[reason] || { label: reason, variant: 'gray' };
  return <Badge label={label} variant={variant} />;
}

// ─── Assigned Agent Panel ─────────────────────────────────────────────────────

function AssignedAgentPanel({ ticket, onAssigned }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Load agents list once
  useEffect(() => {
    agentService.getAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoadingAgents(false));
  }, []);

  // Filter agents to those who handle this ticket's category (client-side)
  const matchingAgents = ticket.category
    ? agents.filter((a) => a.categories?.includes(ticket.category))
    : agents;

  // Fall back to all agents if none match the category
  const dropdownAgents = matchingAgents.length > 0 ? matchingAgents : agents;

  const suggestedAgent = ticket.ai_suggested_agent_id
    ? agents.find((a) => a.id === ticket.ai_suggested_agent_id)
    : null;

  const handleAcceptSuggestion = async () => {
    if (!suggestedAgent) return;
    setIsAssigning(true);
    try {
      const updated = await ticketService.assignAgent(ticket.id, suggestedAgent.id, 'ai_suggested');
      onAssigned(updated);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: `Assignment failed: ${err.message}`, type: 'error' },
      }));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedAgentId) return;
    setIsAssigning(true);
    const reason = ticket.assigned_agent_id ? 'reassigned' : 'manual';
    try {
      const updated = await ticketService.assignAgent(ticket.id, Number(selectedAgentId), reason);
      onAssigned(updated);
      setSelectedAgentId('');
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: `Assignment failed: ${err.message}`, type: 'error' },
      }));
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
        Assigned Agent
      </h3>

      {/* ── Current assignee ── */}
      {ticket.assigned_agent ? (
        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {ticket.assigned_agent.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{ticket.assigned_agent.email}</p>
            {ticket.assignment_reason && (
              <div className="mt-1.5">
                <AssignmentReasonBadge reason={ticket.assignment_reason} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-400 italic">
          <User className="w-4 h-4" />
          No agent assigned yet
        </div>
      )}

      {/* ── AI Suggestion banner ── */}
      {suggestedAgent && !ticket.assigned_agent_id && (
        <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            AI Suggestion
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{suggestedAgent.name}</p>
              <p className="text-xs text-slate-500 truncate">{suggestedAgent.email}</p>
            </div>
            <button
              id="accept-ai-suggestion-btn"
              onClick={handleAcceptSuggestion}
              disabled={isAssigning}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {isAssigning ? (
                <RefreshCcw className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Accept
            </button>
          </div>
        </div>
      )}

      {/* ── Manual assignment dropdown ── */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500">
          {ticket.assigned_agent_id ? 'Reassign to agent' : 'Assign to agent'}
          {matchingAgents.length > 0 && ticket.category && (
            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-[11px] border border-indigo-100">
              {matchingAgents.length} agent{matchingAgents.length !== 1 ? 's' : ''} available for {ticket.category}
            </span>
          )}
        </p>

        {loadingAgents ? (
          <div className="h-9 bg-slate-100 animate-pulse rounded-lg" />
        ) : (
          <div className="relative">
            <select
              id="agent-assignment-select"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="">Select agent…</option>
              {dropdownAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.open_ticket_count} open)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}

        <button
          id="assign-agent-btn"
          onClick={handleManualAssign}
          disabled={!selectedAgentId || isAssigning}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isAssigning ? (
            <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          {ticket.assigned_agent_id ? 'Reassign' : 'Assign Agent'}
        </button>
      </div>
    </div>
  );
}

// ─── Classification Feedback Card (agent only) ─────────────────────────────────

const CATEGORIES = ['billing', 'technical', 'general', 'account', 'shipping', 'refund', 'other'];
const URGENCIES = ['low', 'medium', 'high', 'critical'];

function ClassificationFeedbackCard({ ticketId }) {
  const [hasFeedback, setHasFeedback] = useState(null); // null = loading
  const [isCorrect, setIsCorrect] = useState(null);     // true | false | null
  const [correctCategory, setCorrectCategory] = useState('');
  const [correctUrgency, setCorrectUrgency] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check on mount whether feedback was already submitted
  useEffect(() => {
    feedbackService.getTicketFeedback(ticketId)
      .then((data) => setHasFeedback(!!data))
      .catch(() => setHasFeedback(false)); // silently fall back to showing the form
  }, [ticketId]);

  const handleSubmit = async () => {
    if (isCorrect === null) return;
    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback(ticketId, {
        is_correct: isCorrect,
        correct_category: isCorrect ? null : (correctCategory || null),
        correct_urgency: isCorrect ? null : (correctUrgency || null),
        feedback_note: feedbackNote || null,
      });
      setSubmitted(true);
      setHasFeedback(true);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: `Feedback error: ${err.message}`, type: 'error' },
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (hasFeedback === null) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4 mb-3" />
        <div className="h-8 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  // Already submitted — or just submitted
  if (hasFeedback || submitted) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Thanks for your feedback!</p>
            <p className="text-xs text-slate-500 mt-0.5">Your input helps improve AI accuracy.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
        Was this classification correct?
      </h3>

      {/* Correct / Incorrect toggle */}
      <div className="flex gap-2">
        <button
          id="feedback-correct-btn"
          onClick={() => setIsCorrect(true)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
            isCorrect === true
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" /> Correct
        </button>
        <button
          id="feedback-incorrect-btn"
          onClick={() => setIsCorrect(false)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
            isCorrect === false
              ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
          }`}
        >
          <ThumbsDown className="w-4 h-4" /> Incorrect
        </button>
      </div>

      {/* Correction fields — only when "Incorrect" is selected */}
      {isCorrect === false && (
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">Help us improve (optional)</p>

          {/* Correct category */}
          <div className="relative">
            <select
              id="feedback-category-select"
              value={correctCategory}
              onChange={(e) => setCorrectCategory(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="">What should the category be?</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Correct urgency */}
          <div className="relative">
            <select
              id="feedback-urgency-select"
              value={correctUrgency}
              onChange={(e) => setCorrectUrgency(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="">What should the urgency be?</option>
              {URGENCIES.map((u) => (
                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Optional note */}
          <textarea
            id="feedback-note-textarea"
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Any additional notes? (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
          />
        </div>
      )}

      {/* Submit */}
      <button
        id="feedback-submit-btn"
        onClick={handleSubmit}
        disabled={isCorrect === null || isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-sm shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {isSubmitting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Submit Feedback
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────────

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null); // stores the status being updated to, or null
  const [toastMessage, setToastMessage] = useState(null);

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

    // Open a Server-Sent Events connection for real-time ticket updates.
    // EventSource cannot send custom headers, so we pass the JWT as a query param.
    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || '';
    const sseUrl = `${apiBase}/tickets/${id}/stream?token=${token}`;
    const es = new EventSource(sseUrl);

    es.onmessage = (event) => {
      // Ignore heartbeat pings
      if (event.data === 'ping') return;
      try {
        const updated = JSON.parse(event.data);

        if (updated._event === 'ticket_assigned') {
          // Spread-merge so we never wipe existing fields
          setTicket((prev) => (prev ? { ...prev, ...updated } : updated));

          // Show a subtle toast for assignment updates from other admin sessions
          window.dispatchEvent(new CustomEvent('toast:show', {
            detail: { message: 'Ticket assignment updated', type: 'info' },
          }));
        } else {
          // Status update or other event — apply same spread-merge pattern
          setTicket((prev) => (prev ? { ...prev, ...updated } : updated));
        }
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

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'blue';
      case 'in_progress': return 'yellow';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!ticket || ticket.status.toLowerCase() === newStatus) return;
    
    setIsUpdatingStatus(newStatus);
    try {
      const updatedTicket = await ticketService.updateTicketStatus(ticket.id, newStatus);
      setTicket((prev) => ({ ...prev, ...updatedTicket }));
      
      // Show success toast
      setToastMessage(`Ticket marked as ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Called by AssignedAgentPanel when assignment succeeds
  const handleAssigned = useCallback((updatedTicket) => {
    setTicket((prev) => ({ ...prev, ...updatedTicket }));
    window.dispatchEvent(new CustomEvent('toast:show', {
      detail: { message: 'Agent assigned successfully', type: 'success' },
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCcw className="w-9 h-9 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading ticket details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load ticket</h2>
        <p className="text-sm text-red-500 mb-6">{error}</p>
        <Link 
          to="/admin/tickets"
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-5xl mx-auto pb-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-white border border-indigo-100 text-slate-900 px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center space-x-3 transition-opacity duration-300 z-50">
          <CheckCircle className="w-5 h-5 text-indigo-500" />
          <span className="font-medium capitalize text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/admin/tickets')}
          className="flex items-center text-sm text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Tickets
        </button>
        <StatusActions 
          currentStatus={ticket.status} 
          isUpdating={isUpdatingStatus} 
          onUpdateStatus={handleUpdateStatus}
          role={role}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header & Message */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4 gap-4 flex-col sm:flex-row">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{ticket.subject}</h1>
                <Badge label={ticket.status} variant={getStatusVariant(ticket.status)} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span className="font-medium text-slate-900 mr-1">{ticket.customer_name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5" />
                  <a href={`mailto:${ticket.customer_email}`} className="text-indigo-600 hover:underline">
                    {ticket.customer_email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatDate(ticket.created_at)}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Original Message</h3>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[150px] text-sm">
                {ticket.message}
              </div>
            </div>
          </div>

          {/* AI Draft Response Box */}
          <DraftResponseBox draftResponse={ticket.ai_draft_response} />
        </div>

        {/* Sidebar (Right Col) */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Analysis metadata — hide confidence score from agents (passed via prop) */}
          <TicketMetadata ticket={ticket} role={role} />

          {/* Assigned Agent Panel — admin only */}
          {role === 'admin' && (
            <AssignedAgentPanel ticket={ticket} onAssigned={handleAssigned} />
          )}

          {/* Agent self-confirmation: show a simple "Assigned to you" card */}
          {role === 'agent' && ticket.assigned_agent && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Assigned To</h3>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{ticket.assigned_agent.name}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">Assigned to you</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Classification Feedback — agent only, only when ticket is assigned to this agent */}
          {role === 'agent' && ticket.assigned_agent_id === user?.id && (
            <ClassificationFeedbackCard ticketId={ticket.id} />
          )}

          {/* Ticket Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Ticket Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ticket ID</span>
                <span className="font-mono text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">#{ticket.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{formatDate(ticket.created_at)}</span>
              </div>
              {ticket.assigned_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Assigned</span>
                  <span className="font-medium text-slate-900">{formatDate(ticket.assigned_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
