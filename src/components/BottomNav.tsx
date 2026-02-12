import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  PenSquare, 
  FolderTree, 
  Settings, 
  Box,
  FolderPlus,
  Upload,
  Trash2,
  History,
  Trash,
  Globe,
  Code,
  Braces,
  Shield,
  Save,
  Send,
  UserPlus,
  Eye,
  Edit3,
  CheckSquare
} from 'lucide-react';
import { cn } from '../utils/cn';

interface BottomNavProps {
  onOpenSidebar: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    const handleSelectionCount = (e: any) => {
      setSelectedCount(e.detail || 0);
    };
    window.addEventListener('potato-selection-count', handleSelectionCount);
    return () => window.removeEventListener('potato-selection-count', handleSelectionCount);
  }, []);

  // Clear selection count on navigation
  useEffect(() => {
    setSelectedCount(0);
  }, [path]);

  const handleAction = (actionName: string) => {
    window.dispatchEvent(new CustomEvent('potato-action', { detail: actionName }));
  };

  const getNavItems = () => {
    const defaultMenu = { icon: <Menu size={22} />, label: 'Menu', onClick: onOpenSidebar, active: false };
    const defaultSettings = { icon: <Settings size={22} />, label: 'Settings', onClick: () => navigate('/settings'), active: path === '/settings' };

    // All Content: Menu, Preview, Create Post, Edit and Delete
    if (path === '/content') {
      const isSingleSelected = selectedCount === 1;
      const isAnySelected = selectedCount > 0;

      return [
        defaultMenu,
        { 
          icon: <Eye size={22} />, 
          label: 'Preview', 
          onClick: () => handleAction('preview-post'), 
          active: false,
          colorClass: isSingleSelected ? "text-emerald-500" : "text-foreground/40",
          bgClass: isSingleSelected ? "bg-emerald-500/10" : "bg-transparent"
        },
        { icon: <PenSquare size={22} />, label: 'Create', onClick: () => navigate('/create-post'), active: false },
        { 
          icon: <Edit3 size={22} />, 
          label: 'Edit', 
          onClick: () => handleAction('edit-post'), 
          active: false,
          colorClass: isSingleSelected ? "text-emerald-500" : "text-foreground/40",
          bgClass: isSingleSelected ? "bg-emerald-500/10" : "bg-transparent"
        },
        { 
          icon: <Trash2 size={22} />, 
          label: 'Delete', 
          onClick: () => handleAction('delete-post'), 
          active: false,
          colorClass: isAnySelected ? "text-red-500" : "text-foreground/40",
          bgClass: isAnySelected ? "bg-red-500/10" : "bg-transparent"
        }
      ];
    }

    // Workbench: Menu, Drafts, New Drafts, Pending Review and Settings
    if (path === '/workbench') {
      const isSingleSelected = selectedCount === 1;
      const isAnySelected = selectedCount > 0;

      return [
        defaultMenu,
        { 
          icon: <Eye size={22} />, 
          label: 'Preview', 
          onClick: () => handleAction('preview-item'), 
          active: false,
          colorClass: isSingleSelected ? "text-emerald-500" : "text-foreground/40",
          bgClass: isSingleSelected ? "bg-emerald-500/10" : "bg-transparent"
        },
        { 
          icon: <Edit3 size={22} />, 
          label: 'Edit', 
          onClick: () => handleAction('edit-item'), 
          active: false,
          colorClass: isSingleSelected ? "text-emerald-500" : "text-foreground/40",
          bgClass: isSingleSelected ? "bg-emerald-500/10" : "bg-transparent"
        },
        { 
          icon: <Trash2 size={22} />, 
          label: 'Delete', 
          onClick: () => handleAction('delete-item'), 
          active: false,
          colorClass: isAnySelected ? "text-red-500" : "text-foreground/40",
          bgClass: isAnySelected ? "bg-red-500/10" : "bg-transparent"
        },
        defaultSettings
      ];
    }

    // ... rest of the nav items logic (I'll keep them consistent)
    // Dashboard
    if (path === '/') {
      return [
        defaultMenu,
        { icon: <Box size={22} />, label: 'Workbench', onClick: () => navigate('/workbench'), active: false },
        { icon: <PenSquare size={22} />, label: 'Create', onClick: () => navigate('/create-post'), active: false },
        { icon: <UserPlus size={22} />, label: 'Editors', onClick: () => navigate('/editors'), active: false },
        defaultSettings
      ];
    }

    // Create Post / Edit: Menu, Preview (Live), Publish, Save and Settings
    if (path === '/create-post' || path.startsWith('/edit/')) {
      return [
        defaultMenu,
        { icon: <Eye size={22} />, label: 'Preview', onClick: () => handleAction('toggle-live-preview'), active: false },
        { icon: <Send size={22} />, label: 'Publish', onClick: () => handleAction('publish-post'), active: false },
        { icon: <Save size={22} />, label: 'Save', onClick: () => handleAction('save-draft'), active: false },
        defaultSettings
      ];
    }

    // Media Library
    if (path === '/media') {
      return [
        defaultMenu,
        { icon: <FolderPlus size={22} />, label: 'New Folder', onClick: () => handleAction('new-folder'), active: false },
        { icon: <FolderTree size={22} />, label: 'Explorer', onClick: () => handleAction('toggle-explorer'), active: false },
        { icon: <Upload size={22} />, label: 'Upload', onClick: () => handleAction('upload-asset'), active: false },
        defaultSettings
      ];
    }

    // Trash: Menu, Restore, Delete, Select All, Empty Trash
    if (path === '/trash') {
      const isAnySelected = selectedCount > 0;
      return [
        defaultMenu,
        { 
          icon: <History size={22} />, 
          label: 'Restore', 
          onClick: () => handleAction('restore-all'), 
          active: false,
          colorClass: isAnySelected ? "text-emerald-500" : "text-foreground/40",
          bgClass: isAnySelected ? "bg-emerald-500/10" : "bg-transparent"
        },
        { 
          icon: <Trash size={22} />, 
          label: 'Delete', 
          onClick: () => handleAction('delete-all'), 
          active: false,
          colorClass: isAnySelected ? "text-red-500" : "text-foreground/40",
          bgClass: isAnySelected ? "bg-red-500/10" : "bg-transparent"
        },
        { icon: <CheckSquare size={22} />, label: 'Select All', onClick: () => handleAction('select-all'), active: false },
        { icon: <Trash2 size={22} />, label: 'Empty', onClick: () => handleAction('empty-trash'), active: false }
      ];
    }

    // Manage Editors
    if (path === '/editors') {
      return [
        defaultMenu,
        { icon: <Box size={22} />, label: 'Workbench', onClick: () => navigate('/workbench'), active: false },
        { icon: <UserPlus size={22} />, label: 'Add New', onClick: () => handleAction('add-editor'), active: false },
        { icon: <FolderTree size={22} />, label: 'Media', onClick: () => navigate('/media'), active: false },
        defaultSettings
      ];
    }

    // Settings
    if (path === '/settings') {
      return [
        defaultMenu,
        { icon: <Globe size={22} />, label: 'General', onClick: () => handleAction('tab-general'), active: false },
        { icon: <Code size={22} />, label: 'GitHub', onClick: () => handleAction('tab-github'), active: false },
        { icon: <Braces size={22} />, label: 'Schema', onClick: () => handleAction('tab-schema'), active: false },
        { icon: <Shield size={22} />, label: 'Security', onClick: () => handleAction('tab-security'), active: false },
        { icon: <Save size={22} />, label: 'Save', onClick: () => handleAction('save-settings'), active: false }
      ];
    }

    return [defaultMenu, { icon: <Box size={22} />, label: 'Workbench', onClick: () => navigate('/workbench'), active: false }, { icon: <PenSquare size={22} />, label: 'Create', onClick: () => navigate('/create-post'), active: false }, defaultSettings];
  };

  const navItems = getNavItems();

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-[100] px-1 pb-safe-area-inset-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-20 max-w-2xl mx-auto">
        {navItems.map((item: any, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 py-2 rounded-2xl transition-all active:scale-90",
              item.active ? "text-indigo-600" : (item.colorClass || "text-foreground/40")
            )}
          >
            <div className={cn(
              "p-1 rounded-lg transition-colors",
              item.active ? "bg-indigo-500/10" : (item.bgClass || "bg-transparent")
            )}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center px-1 leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
