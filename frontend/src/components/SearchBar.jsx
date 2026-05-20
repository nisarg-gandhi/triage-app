import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, disabled, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Sync internal state if initialValue changes (e.g. from URL)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only call onSearch if the searchTerm is actually different from initialValue 
      // to avoid infinite update loops
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, initialValue, onSearch]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search tickets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
        disabled={disabled}
      />
    </div>
  );
}
