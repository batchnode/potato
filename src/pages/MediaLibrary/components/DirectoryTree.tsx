import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, ChevronDown, FolderOpen, Image as ImageIcon, FileText, File } from 'lucide-react';
import { useConfig } from '../../../hooks/useStorage';
import { cn } from '../../../utils/cn';

interface TreeItemProps {
  name: string;
  path: string; // path relative to assetsDir
  type: 'dir' | 'file';
  currentPath: string;
  onSelect: (path: string) => void;
  level: number;
}

const getFileIcon = (name: string, isSelected: boolean) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const colorClass = isSelected ? "text-white" : "text-indigo-400";
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <ImageIcon size={14} className={cn("shrink-0", colorClass)} />;
  if (['md', 'txt'].includes(ext || '')) return <FileText size={14} className={cn("shrink-0", colorClass)} />;
  return <File size={14} className={cn("shrink-0", colorClass)} />;
};

const TreeItem: React.FC<TreeItemProps> = ({ name, path, type, currentPath, onSelect, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const config = useConfig();

  const isSelected = currentPath === path;
  const isParentOfSelected = currentPath.startsWith(path + '/');

  useEffect(() => {
    if (isParentOfSelected && !isOpen && type === 'dir') {
      setIsOpen(true);
    }
  }, [isParentOfSelected, isOpen, type]);

  useEffect(() => {
    if (isOpen && children.length === 0 && !loading && type === 'dir') {
      fetchChildren();
    }
  }, [isOpen, type]);

  const fetchChildren = async () => {
    if (!config.repo) return;
    setLoading(true);
    const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
    const fullPath = path ? `${basePath}/${path}` : basePath;
    
    try {
      const response = await fetch(`/api/github_contents?repo=${config.repo}&path=${fullPath}&branch=${config.branch}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter out .keep files
        const filtered = data.filter(item => item.name !== '.keep');
        
        // Sort: Directories first (alphabetical), then files
        const sorted = filtered.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'dir' ? -1 : 1;
        });
        
        setChildren(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch subdirectories", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'dir') setIsOpen(!isOpen);
    else onSelect(path);
  };

  const handleSelect = () => {
    if (type === 'file') {
      // For files, we might want to select the parent folder or just do nothing
      // Given the requirement "clicking any other directory loads the content", 
      // selecting a file might not change the main view or could select its parent.
      // For now, let's just allow folders to be selectable.
      return;
    }
    onSelect(path);
  };

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-200 group",
          isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-foreground/5 text-foreground/60 hover:text-foreground"
        )}
        style={{ marginLeft: `${level * 0.5}rem` }}
        onClick={handleSelect}
      >
        {type === 'dir' ? (
          <>
            <button 
              onClick={toggleOpen}
              className={cn(
                "p-1 rounded-md transition-colors",
                isSelected ? "hover:bg-white/20" : "hover:bg-foreground/10"
              )}
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen ? (
              <FolderOpen size={16} className={cn("shrink-0", isSelected ? "text-white" : "text-indigo-500")} />
            ) : (
              <Folder size={16} className={cn("shrink-0", isSelected ? "text-white" : "text-indigo-400")} />
            )}
          </>
        ) : (
          <div className="pl-6 flex items-center gap-2">
            {getFileIcon(name, isSelected)}
          </div>
        )}
        <span className={cn("text-sm truncate tracking-tight", type === 'dir' ? "font-bold" : "font-medium opacity-80")}>{name}</span>
      </div>
      
      {isOpen && type === 'dir' && (
        <div className="mt-1 flex flex-col gap-1 border-l border-foreground/5 ml-4">
          {loading ? (
             <div className="py-2 text-[10px] uppercase tracking-widest font-black opacity-20 text-center">Loading...</div>
          ) : children.length === 0 ? (
             <div className="py-2 text-[10px] uppercase tracking-widest font-black opacity-10 text-center">Empty</div>
          ) : (
            children.map(child => (
              <TreeItem 
                key={child.path}
                name={child.name}
                type={child.type as 'dir' | 'file'}
                path={path ? `${path}/${child.name}` : child.name}
                currentPath={currentPath}
                onSelect={onSelect}
                level={0}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const DirectoryTree: React.FC<{ currentPath: string; onSelect: (path: string) => void }> = ({ currentPath, onSelect }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Explorer</h3>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar border-2 border-foreground/5 rounded-[2.5rem] p-4 bg-foreground/[0.02] scrolling-touch">
        <div className="space-y-1">
          <div 
            className={cn(
              "flex items-center gap-2 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
              currentPath === '' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-foreground/5 text-foreground/60 hover:text-foreground"
            )}
            onClick={() => onSelect('')}
          >
            <div className="p-1">
               <FolderOpen size={16} className={cn("shrink-0", currentPath === '' ? "text-white" : "text-indigo-500")} />
            </div>
            <span className="text-sm font-bold truncate tracking-tight">Media Root</span>
          </div>
          <RootTreeItems currentPath={currentPath} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

const RootTreeItems: React.FC<{ currentPath: string; onSelect: (path: string) => void }> = ({ currentPath, onSelect }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const config = useConfig();

  useEffect(() => {
    const fetchRootItems = async () => {
      if (!config.repo) return;
      const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
      try {
        const response = await fetch(`/api/github_contents?repo=${config.repo}&path=${basePath}&branch=${config.branch}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter out .keep
          const filtered = data.filter(item => item.name !== '.keep');
          
          // Sort: Directories first (alphabetical), then files
          const sorted = filtered.sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name);
            }
            return a.type === 'dir' ? -1 : 1;
          });
          
          setItems(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRootItems();
  }, [config.repo, config.assetsDir, config.branch]);

  if (loading) return (
    <div className="flex flex-col gap-2 animate-pulse px-2 pt-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-10 bg-foreground/5 rounded-xl w-full" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      {items.map(item => (
        <TreeItem 
          key={item.path}
          name={item.name}
          type={item.type as 'dir' | 'file'}
          path={item.name}
          currentPath={currentPath}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </div>
  );
};
