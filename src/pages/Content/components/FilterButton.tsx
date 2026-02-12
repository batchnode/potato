import React from 'react';

interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground/60 rounded-xl text-xs font-bold hover:border-indigo-500/50 hover:text-indigo-500 transition whitespace-nowrap active:scale-95">
    {icon} {label}
  </button>
);

export default FilterButton;
