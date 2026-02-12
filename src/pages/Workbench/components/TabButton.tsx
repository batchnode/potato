import React from 'react';
import { cn } from '../../../utils/cn';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 font-bold text-sm transition border-b-2",
      active
        ? "text-indigo-500 border-indigo-500"
        : "text-foreground/40 border-transparent hover:text-foreground/60"
    )}
  >
    {icon}
    <span>{label}</span>
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-black",
      active ? "bg-indigo-500/20 text-indigo-500" : "bg-foreground/10 text-foreground/40"
    )}>
      {count}
    </span>
  </button>
);

export default TabButton;
