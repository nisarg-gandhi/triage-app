export default function Badge({ label, variant = 'gray' }) {
  if (!label) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-medium border bg-slate-50 text-slate-400 border-slate-200 inline-flex items-center justify-center whitespace-nowrap shadow-sm">
        N/A
      </span>
    );
  }

  const dotColors = {
    gray: 'bg-slate-400',
    blue: 'bg-indigo-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    yellow: 'bg-amber-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
  };

  const dotColor = dotColors[variant] || dotColors.gray;

  const displayLabel = typeof label === 'string' ? label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ') : label;

  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-medium border bg-white text-slate-700 border-slate-200 shadow-sm inline-flex items-center max-w-full">
      <span className={`w-1.5 h-1.5 flex-shrink-0 rounded-full mr-1.5 ${dotColor}`}></span>
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}
