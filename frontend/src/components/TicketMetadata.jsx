import Badge from './Badge';
import { AlertCircle } from 'lucide-react';

export default function TicketMetadata({ ticket }) {
  const getUrgencyVariant = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getSentimentVariant = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">AI Analysis</h3>
        {ticket.needs_review && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Review
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex flex-col space-y-1 p-3 bg-slate-50/50 rounded-lg border border-slate-100 min-w-[120px]">
          <span className="text-xs text-slate-500 font-medium">Category</span>
          <Badge label={ticket.category} variant="indigo" />
        </div>

        <div className="flex flex-col space-y-1 p-3 bg-slate-50/50 rounded-lg border border-slate-100 min-w-[120px]">
          <span className="text-xs text-slate-500 font-medium">Urgency</span>
          <Badge label={ticket.urgency} variant={getUrgencyVariant(ticket.urgency)} />
        </div>

        <div className="flex flex-col space-y-1 p-3 bg-slate-50/50 rounded-lg border border-slate-100 min-w-[120px]">
          <span className="text-xs text-slate-500 font-medium">Sentiment</span>
          <Badge label={ticket.sentiment} variant={getSentimentVariant(ticket.sentiment)} />
        </div>
      </div>
      
      {ticket.routing_reasoning && (
        <div className="mb-4 bg-slate-50/50 rounded-lg border border-slate-100 p-3">
          <p className="text-sm italic text-slate-600 line-clamp-2">{ticket.routing_reasoning}</p>
        </div>
      )}
      
      {ticket.confidence !== undefined && ticket.confidence !== null && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Confidence Score</span>
            <span className="text-slate-700 font-bold">{(ticket.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${ticket.confidence >= 0.8 ? 'bg-green-500' : ticket.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              style={{ width: `${Math.max(0, Math.min(100, ticket.confidence * 100))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
