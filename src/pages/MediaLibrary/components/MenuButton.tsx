import React from 'react';
import { cn } from '../../../utils/cn';

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-5 py-4 text-xs font-bold transition-colors active:bg-foreground/10",
      danger ? 'text-red-500 hover:bg-red-500/10' : 'text-foreground/60 hover:bg-foreground/5'
    )}
  >
    {icon} <span>{label}</span>
  </button>
);

export default MenuButton;
