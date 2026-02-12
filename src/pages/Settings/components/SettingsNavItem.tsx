import React from 'react';
import { cn } from '../../../utils/cn';

interface SettingsNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SettingsNavItem: React.FC<SettingsNavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition text-sm font-bold",
      active ? 'bg-card text-indigo-600 shadow-sm border border-border' : 'text-foreground/50 hover:bg-card-foreground/5'
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default SettingsNavItem;
