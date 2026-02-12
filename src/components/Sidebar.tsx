import React from 'react';
import { cn } from '../utils/cn';
import { useSidebarLogic } from './Sidebar/hooks/useSidebarLogic';
import SidebarLogo from './Sidebar/components/SidebarLogo';
import SidebarNav from './Sidebar/components/SidebarNav';
import SidebarProfile from './Sidebar/components/SidebarProfile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    user,
    config,
    draftCount,
    trashCount,
    isAdmin
  } = useSidebarLogic();

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 z-[80] transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] xl:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 right-0 bottom-0 w-full bg-sidebar text-sidebar-foreground z-[90] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] flex flex-col",
          "xl:relative xl:inset-y-0 xl:w-72 xl:translate-y-0 xl:rounded-none xl:border-r xl:border-sidebar-border xl:h-full xl:pb-0",
          // Mobile state
          "h-[calc(100dvh-5rem)] rounded-t-[3rem] pb-24", 
          !isOpen ? "translate-y-full" : "translate-y-0"
        )}
      >
        <SidebarLogo onClose={onClose} />

        <SidebarNav 
          onClose={onClose}
          draftCount={draftCount}
          trashCount={trashCount}
          isAdmin={isAdmin}
          config={config}
        />

        <SidebarProfile 
          user={user}
          isAdmin={isAdmin}
        />
      </aside>
    </>
  );
};

export default Sidebar;