import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Mail, AlertCircle, RefreshCcw, CheckCircle } from 'lucide-react';
import ticketService from '../services/ticketService';
import TicketMetadata from '../components/TicketMetadata';
import DraftResponseBox from '../components/DraftResponseBox';
import Badge from '../components/Badge';
import StatusActions from '../components/StatusActions';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      setTicket(updatedTicket);
      
      // Show success toast
      setToastMessage(`Ticket marked as ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCcw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load ticket</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <Link 
          to="/tickets"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const isResolved = ticket?.status?.toLowerCase() === 'resolved';

  return (
    <div className="max-w-5xl mx-auto pb-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 transition-opacity duration-300 z-50">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium capitalize">{toastMessage}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/tickets')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Tickets
        </button>
        <StatusActions 
          currentStatus={ticket.status} 
          isUpdating={isUpdatingStatus} 
          onUpdateStatus={handleUpdateStatus} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header & Message */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                <Badge label={ticket.status} variant={getStatusVariant(ticket.status)} />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span className="font-medium text-gray-900 mr-1">{ticket.customer_name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5" />
                  <a href={`mailto:${ticket.customer_email}`} className="text-indigo-600 hover:underline">
                    {ticket.customer_email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(ticket.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Original Message</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[150px]">
                {ticket.message}
              </div>
            </div>
          </div>

          {/* AI Draft Response Box */}
          <DraftResponseBox draftResponse={ticket.ai_draft_response} />
        </div>

        {/* Sidebar (Right Col) */}
        <div className="lg:col-span-1">
          <TicketMetadata ticket={ticket} />
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Ticket Info</h3>
             <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ticket ID</span>
                  <span className="font-medium text-gray-900">#{ticket.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
