import React from 'react';
import { Plus, Eye, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ContentHeaderProps {
  onNewPost: () => void;
  selectedCount: number;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ 
  onNewPost, 
  selectedCount, 
  onPreview, 
  onEdit, 
  onDelete 
}) => {
  const isSingleSelected = selectedCount === 1;
  const isAnySelected = selectedCount > 0;

  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div>
        <h1 className="text-xl font-bold text-foreground leading-tight">All Content</h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Manage production files</p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Desktop Action Bar */}
        <div className="hidden xl:flex items-center gap-2 border-r border-sidebar-border pr-4 mr-2">
          <button
            onClick={onPreview}
            disabled={!isSingleSelected}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95",
              isSingleSelected 
                ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20" 
                : "text-foreground/20 cursor-not-allowed opacity-40 border border-transparent"
            )}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={onEdit}
            disabled={!isSingleSelected}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95",
              isSingleSelected 
                ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20" 
                : "text-foreground/20 cursor-not-allowed opacity-40 border border-transparent"
            )}
          >
            <Edit3 size={16} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={!isAnySelected}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95",
              isAnySelected 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                : "text-foreground/20 cursor-not-allowed opacity-40 border border-transparent"
            )}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>

        <button
          onClick={onNewPost}
          className="hidden xl:flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} /> Create New Post
        </button>
      </div>
    </header>
  );
};

export default ContentHeader;
