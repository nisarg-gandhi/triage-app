export default function Badge({ label, variant = 'gray' }) {
  if (!label) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-400 border-gray-100 inline-flex items-center justify-center whitespace-nowrap">
        N/A
      </span>
    );
  }

  const variants = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const style = variants[variant] || variants.gray;

  // Capitalize first letter or keep as is, depending on use case. We can just render label.
  const displayLabel = typeof label === 'string' ? label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ') : label;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} inline-flex items-center justify-center whitespace-nowrap`}>
      {displayLabel}
    </span>
  );
}
