import React from 'react';
import { cn } from '../../../utils/cn';

interface ThemeOptionProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all",
      active ? 'bg-indigo-500/10 border-indigo-600 text-indigo-500' : 'bg-input-bg border-transparent text-foreground/40 hover:bg-foreground/5'
    )}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
    {active && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
  </button>
);

export default ThemeOption;
