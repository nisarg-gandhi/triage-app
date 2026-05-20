import { RefreshCcw, CheckCircle, Clock } from 'lucide-react';

export default function StatusActions({ currentStatus, isUpdating, onUpdateStatus }) {
  const isResolved = currentStatus?.toLowerCase() === 'resolved';
  const isInProgress = currentStatus?.toLowerCase() === 'in_progress';

  return (
    <div className="flex space-x-3">
      {/* Mark In Progress Button */}
      <button 
        onClick={() => onUpdateStatus('in_progress')}
        disabled={isResolved || isInProgress || isUpdating}
        className={`flex items-center px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
          isResolved || isInProgress 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-70'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-400'
        }`}
      >
        {isUpdating === 'in_progress' ? (
          <RefreshCcw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
        ) : (
          <Clock className={`w-4 h-4 mr-2 transition-colors ${isResolved || isInProgress ? 'text-gray-400' : 'text-yellow-500'}`} />
        )}
        {isInProgress ? 'In Progress' : 'Mark In Progress'}
      </button>

      {/* Mark Resolved Button */}
      <button 
        onClick={() => onUpdateStatus('resolved')}
        disabled={isResolved || isUpdating}
        className={`flex items-center px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
          isResolved 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-70'
            : 'border-green-300 text-green-700 hover:bg-green-50 hover:shadow-md hover:border-green-400'
        }`}
      >
        {isUpdating === 'resolved' ? (
          <RefreshCcw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
        ) : (
          <CheckCircle className={`w-4 h-4 mr-2 transition-colors ${isResolved ? 'text-gray-400' : 'text-green-500'}`} />
        )}
        {isResolved ? 'Resolved' : 'Mark Resolved'}
      </button>
    </div>
  );
}
