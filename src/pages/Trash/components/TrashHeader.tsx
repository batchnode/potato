import React from 'react';
import { Trash2, Trash } from 'lucide-react';

interface TrashHeaderProps {
  onEmptyTrash: () => void;
  canDelete: boolean;
  hasItems: boolean;
}

const TrashHeader: React.FC<TrashHeaderProps> = ({ onEmptyTrash, canDelete, hasItems }) => {
  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div>
        <h1 className="text-xl font-bold text-foreground leading-tight flex items-center gap-3">
          Trash <Trash2 className="text-red-500" size={20} />
        </h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Manage deleted content</p>
      </div>
      {canDelete && hasItems && (
        <button
          onClick={onEmptyTrash}
          className="hidden xl:flex items-center justify-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95"
        >
          <Trash size={16} /> Empty Trash
        </button>
      )}
    </header>
  );
};

export default TrashHeader;
