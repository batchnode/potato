import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  external?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge, external, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
        active
          ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
      )}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;
