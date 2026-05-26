import { useNavigate } from 'react-router-dom';
import TicketForm from '../components/TicketForm';
import { ArrowLeft } from 'lucide-react';

export default function UserNewTicket() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </button>
      </div>
      <TicketForm />
    </div>
  );
}
