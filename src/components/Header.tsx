import React from 'react';
import { Menu, Database, ExternalLink, Eye } from 'lucide-react';
import { useConfig, useUser } from '../hooks/useStorage';
import { cn } from '../utils/cn';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const config = useConfig();
  const user = useUser();

  return (
    <header className="h-16 bg-header border-b border-sidebar-border flex items-center justify-between px-6 shrink-0 z-20 transition-colors duration-300">
      <button
        className={cn(
          "hidden p-2 -ml-2 hover:bg-foreground/5 rounded-lg text-foreground/70 transition-colors"
        )}
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 text-foreground/40 text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
        <Database size={12} className="shrink-0" />
        <span className="truncate">Primary Node / {config.branch || 'Main'} Branch</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {user?.role === 'Administrator' && (
          <button
            onClick={() => window.dispatchEvent(new Event('potato-toggle-view-mode'))}
            className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-foreground/60 bg-foreground/5 px-2 md:px-3 py-2 rounded-xl hover:bg-foreground/10 transition"
            title="Switch between Admin and Editor views"
          >
            <Eye size={14} className="shrink-0" /> <span className="hidden xs:inline">Toggle View</span>
          </button>
        )}
        {config.websiteUrl && (
          <a
            href={config.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 md:px-3 py-2 rounded-xl hover:bg-indigo-100 transition shadow-sm hover:shadow-md"
          >
            <ExternalLink size={14} className="shrink-0" /> <span className="hidden xs:inline">Visit Site</span>
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;