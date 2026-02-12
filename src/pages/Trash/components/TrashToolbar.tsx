import React from 'react';
import { Search } from 'lucide-react';

interface TrashToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TrashToolbar: React.FC<TrashToolbarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 px-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search trash..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
        />
      </div>
    </div>
  );
};

export default TrashToolbar;
