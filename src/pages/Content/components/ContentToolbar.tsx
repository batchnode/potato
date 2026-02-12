import React from 'react';
import { Search, Tag, Layers, Calendar } from 'lucide-react';
import FilterButton from './FilterButton';

interface ContentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ContentToolbar: React.FC<ContentToolbarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 px-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by filename..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
        <FilterButton icon={<Tag size={16} />} label="Tags" />
        <FilterButton icon={<Layers size={16} />} label="Category" />
        <FilterButton icon={<Calendar size={16} />} label="Date" />
      </div>
    </div>
  );
};

export default ContentToolbar;
