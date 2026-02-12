import React from 'react';
import { Eye, Edit3, Send, Loader2, CheckCircle2, Trash2, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { GitHubContent } from '../../../types';

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
  highlight?: boolean;
  className?: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, title, danger, highlight, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2.5 rounded-xl border border-transparent transition flex items-center justify-center active:scale-95 disabled:opacity-50",
      danger
        ? "text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
        : highlight
          ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40"
          : "text-foreground/20 hover:text-indigo-500 hover:bg-indigo-500/5 hover:border-border",
      className
    )}
    title={title}
  >
    {icon}
  </button>
);

interface WorkbenchTableProps {
  paginatedItems: GitHubContent[];
  selectedItems: string[];
  activeTab: 'drafts' | 'review';
  searchTerm: string;
  processing: string | null;
  canPublish: boolean;
  sourceDir: string;
  onToggleSelect: (sha: string) => void;
  onPreview: (item: GitHubContent) => void;
  onEdit: (item: GitHubContent) => void;
  onAction: (item: GitHubContent, action: 'submit' | 'approve' | 'delete') => void;
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const WorkbenchTable: React.FC<WorkbenchTableProps> = ({
  paginatedItems,
  selectedItems,
  activeTab,
  searchTerm,
  processing,
  canPublish,
  onToggleSelect,
  onPreview,
  onEdit,
  onAction,
  currentPage,
  totalPages,
  totalFiltered,
  itemsPerPage,
  onPageChange
}) => {
  return (
    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mx-2 min-h-[400px] flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-foreground/40 font-bold uppercase text-[10px] tracking-widest sticky top-0">
            <tr>
              <th className="px-8 py-5">Filename</th>
              <th className="px-8 py-5 hidden sm:table-cell">Status</th>
              <th className="px-8 py-5 text-right hidden xl:table-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-card-foreground font-medium">
            {paginatedItems.map((item) => (
              <tr 
                key={item.sha} 
                onClick={() => onToggleSelect(item.sha)}
                className={cn(
                  "hover:bg-foreground/[0.02] transition-all group cursor-pointer border-l-4",
                  selectedItems.includes(item.sha) 
                    ? "bg-indigo-500/10 border-indigo-500 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]" 
                    : "border-transparent hover:border-indigo-500/20 hover:bg-foreground/5"
                )}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl transition",
                      selectedItems.includes(item.sha) 
                        ? "bg-indigo-500 text-white" 
                        : (activeTab === 'review' ? 'bg-amber-500/10 text-amber-500/50' : 'bg-foreground/5 text-foreground/20')
                    )}>
                      {activeTab === 'review' ? <Clock size={16} /> : <FileText size={16} />}
                    </div>
                    <span className={cn(
                      "font-black font-mono truncate max-w-[140px] md:max-w-md transition",
                      selectedItems.includes(item.sha) ? "text-indigo-600" : "text-foreground/80 group-hover:text-indigo-500"
                    )}>{item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 hidden sm:table-cell">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    activeTab === 'review'
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-blue-500/20 text-blue-500'
                  )}>
                    {activeTab === 'review' ? 'Awaiting Approval' : 'WIP'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right hidden xl:table-cell">
                  <div className="flex justify-end gap-2">
                    <ActionButton
                      icon={<Eye size={14} />}
                      onClick={() => onPreview(item)}
                      title="Quick Preview"
                    />
                    <ActionButton
                      icon={<Edit3 size={14} />}
                      onClick={() => onEdit(item)}
                      title="Edit Post"
                    />
                    {activeTab === 'drafts' && (
                      <ActionButton
                        icon={<Send size={14} />}
                        onClick={() => onAction(item, 'submit')}
                        title="Submit for Review"
                        highlight
                      />
                    )}
                    {activeTab === 'review' && canPublish && (
                      <ActionButton
                        icon={processing === item.sha ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        onClick={() => onAction(item, 'approve')}
                        title="Publish Now"
                        highlight
                        className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                        disabled={processing !== null}
                      />
                    )}
                    <ActionButton
                      icon={<Trash2 size={14} />}
                      onClick={() => onAction(item, 'delete')}
                      title={activeTab === 'review' ? 'Reject & Delete' : 'Delete Draft'}
                      danger
                    />
                  </div>
                </td>
              </tr>
            ))}
            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-12 text-center text-foreground/30 italic font-medium">
                  {searchTerm ? 'No items match your search.' : `No ${activeTab === 'drafts' ? 'drafts' : 'items pending review'} found.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalFiltered > 0 && (
        <div className="p-6 border-t border-border flex justify-between items-center bg-foreground/5 mt-auto">
          <span className="text-xs text-foreground/40 font-medium">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalFiltered)}-{Math.min(currentPage * itemsPerPage, totalFiltered)} of {totalFiltered}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-card border border-border rounded-xl disabled:opacity-50 hover:bg-foreground/5 transition text-foreground active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center px-4 text-xs font-bold text-foreground/60">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 bg-card border border-border rounded-xl disabled:opacity-50 hover:bg-foreground/5 transition text-foreground active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkbenchTable;
