import React from 'react';
import { X } from 'lucide-react';

interface SidebarLogoProps {
  onClose: () => void;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ onClose }) => {
  return (
    <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <img src="/potato.png" alt="Potato Logo" className="w-10 h-10 object-contain" />
        </div>
        <span className="font-bold text-xl tracking-tight">
          Potato
        </span>
      </div>
      <button
        className="xl:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 transition-colors"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default SidebarLogo;
