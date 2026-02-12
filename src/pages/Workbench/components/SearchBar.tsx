import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
      <input
        type="text"
        placeholder="Search by filename..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition text-foreground"
      />
    </div>
  );
};

export default SearchBar;
