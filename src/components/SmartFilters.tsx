
import React from 'react';

interface SmartFiltersProps {
  filters: string[];
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const SmartFilters: React.FC<SmartFiltersProps> = ({ filters, activeFilters, onFilterToggle }) => {
  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-2 overflow-x-auto">
      <div className="flex space-x-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => onFilterToggle(filter)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap
              ${activeFilters.includes(filter)
                ? 'bg-gradient-to-r from-brand-teal to-brand-blue text-white shadow-md'
                : 'bg-white text-neutral-text hover:bg-gray-100 border border-gray-200'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartFilters;
