
import React, { useState } from 'react';
import { ArrowUpIcon, StopIcon } from './icons/Icons';

interface CommandBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onSearch, isLoading, onStop }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
      setQuery(''); // Optionally clear input after search
    }
  };

  return (
    <div className="bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a product or paste a link..."
          className="flex-1 w-full px-4 py-3 text-base bg-neutral-bg border border-gray-200 rounded-full focus:ring-2 focus:ring-brand-blue focus:outline-none transition-shadow"
          disabled={isLoading}
        />
        <button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? onStop : undefined}
          disabled={!isLoading && !query.trim()}
          className={`flex-shrink-0 w-12 h-12 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLoading 
              ? 'bg-gradient-to-r from-brand-red to-orange-500' 
              : 'bg-gradient-to-r from-brand-teal to-brand-blue'
          }`}
          aria-label={isLoading ? "Stop search" : "Submit search"}
        >
          {isLoading ? (
            <StopIcon className="w-6 h-6" />
          ) : (
            <ArrowUpIcon className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
};

export default CommandBar;
