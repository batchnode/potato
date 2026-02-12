import React from 'react';
import { RefreshCw, Plus, Eye, Edit3, Send, CheckCircle2, Trash2, Zap } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface WorkbenchHeaderProps {
  onRefresh: () => void;
  onNewDraft: () => void;
  onReinit?: () => void;
  selectedCount: number;
  activeTab: 'drafts' | 'review';
  canPublish: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onAction: (action: 'submit' | 'approve' | 'delete') => void;
}

const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({ 
  onRefresh, 
  onNewDraft,
  onReinit,
  selectedCount,
  activeTab,
  canPublish,
  onPreview,
  onEdit,
  onAction
}) => {
  const isSingleSelected = selectedCount === 1;
  const isAnySelected = selectedCount > 0;

  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div>
        <h1 className="text-xl font-bold text-foreground leading-tight">Workbench</h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Manage draft content</p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Desktop Action Bar */}
        <div className="hidden xl:flex items-center gap-2 border-r border-sidebar-border pr-4 mr-2">
          {/* ... (buttons remain the same) */}
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

          {activeTab === 'drafts' ? (
            <button
              onClick={() => onAction('submit')}
              disabled={!isAnySelected}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95",
                isAnySelected 
                  ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20" 
                  : "text-foreground/20 cursor-not-allowed opacity-40 border border-transparent"
              )}
            >
              <Send size={16} /> Submit
            </button>
          ) : (
            canPublish && (
              <button
                onClick={() => onAction('approve')}
                disabled={!isAnySelected}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95",
                  isAnySelected 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20" 
                    : "text-foreground/20 cursor-not-allowed opacity-40 border border-transparent"
                )}
              >
                <CheckCircle2 size={16} /> Publish
              </button>
            )
          )}

          <button
            onClick={() => onAction('delete')}
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

        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onReinit}
            className="p-2 hover:bg-amber-500/10 rounded-xl transition text-foreground/20 hover:text-amber-500"
            title="Re-initialize Infrastructure"
          >
            <Zap size={18} />
          </button>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-foreground/5 rounded-xl transition text-foreground/40 hover:text-foreground border border-transparent hover:border-border"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <button
          onClick={onNewDraft}
          className="hidden xl:flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} /> New Draft
        </button>
      </div>
    </header>
  );
};

export default WorkbenchHeader;
