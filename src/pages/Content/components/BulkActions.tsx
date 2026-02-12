import React from 'react';
import { Trash2, CircleAlert } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  canDelete: boolean;
  onBulkAction: (action: 'delete' | 'trash') => void;
  onCancel: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  canDelete,
  onBulkAction,
  onCancel
}) => {
  return (
    <div className="fixed bottom-6 md:bottom-10 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-foreground text-background px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-between md:justify-start gap-4 md:gap-8 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">{selectedCount} Selected</span>
        </div>
        <div className="h-6 w-px bg-background/20 hidden md:block" />
        <div className="flex items-center gap-1 md:gap-3">
          <button
            onClick={() => onBulkAction('trash')}
            className="flex items-center gap-2 p-2 md:px-4 md:py-2 hover:bg-background/10 rounded-xl transition text-sm font-bold"
            title="Move to Trash"
          >
            <Trash2 size={16} /> <span className="hidden sm:inline">Trash</span>
          </button>
          {canDelete && (
            <button
              onClick={() => onBulkAction('delete')}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-bold active:scale-95"
            >
              <CircleAlert size={16} /> <span className="hidden sm:inline">Delete Forever</span>
            </button>
          )}
          <button
            onClick={onCancel}
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition px-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
