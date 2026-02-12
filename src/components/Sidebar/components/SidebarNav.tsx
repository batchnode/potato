import React from 'react';
import { LayoutGrid, Layers, Inbox, FilePlus, Image as ImageIcon, Trash2, Users, Github, Cloud, Settings2 } from 'lucide-react';
import SidebarItem from './SidebarItem';
import type { Config } from '../../../types';

interface SidebarNavProps {
  onClose: () => void;
  draftCount: number;
  trashCount: number;
  isAdmin: boolean;
  config: Config;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onClose, draftCount, trashCount, isAdmin, config }) => {
  return (
    <nav className="flex-1 p-4 space-y-8 overflow-y-auto no-scrollbar">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-3">Workspace</p>
        <SidebarItem to="/" icon={<LayoutGrid size={18} />} label="Dashboard" onClick={onClose} />
        <SidebarItem to="/content" icon={<Layers size={18} />} label="All Content" onClick={onClose} />
        <SidebarItem to="/workbench" icon={<Inbox size={18} />} label="Workbench" badge={draftCount > 0 ? draftCount.toString() : undefined} onClick={onClose} />
        <SidebarItem to="/create-post" icon={<FilePlus size={18} />} label="Create Post" onClick={onClose} />
        <SidebarItem to="/media" icon={<ImageIcon size={18} />} label="Media Library" onClick={onClose} />
        <SidebarItem to="/trash" icon={<Trash2 size={18} />} label="Trash" badge={trashCount > 0 ? trashCount.toString() : undefined} onClick={onClose} />
        {isAdmin && <SidebarItem to="/editors" icon={<Users size={18} />} label="Manage Editors" onClick={onClose} />}
      </div>

      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-3">Infrastructure & Settings</p>
        {isAdmin && (
          <>
            <SidebarItem
              to={config.repo ? `https://github.com/${config.repo}` : '/settings'}
              icon={<Github size={18} />}
              label="GitHub Repository"
              external
              onClick={onClose}
            />
            <SidebarItem
              to="https://dash.cloudflare.com"
              icon={<Cloud size={18} />}
              label="Cloudflare Dash"
              external
              onClick={onClose}
            />
          </>
        )}
        <SidebarItem to="/settings" icon={<Settings2 size={18} />} label="System Settings" onClick={onClose} />
      </div>
    </nav>
  );
};

export default SidebarNav;
