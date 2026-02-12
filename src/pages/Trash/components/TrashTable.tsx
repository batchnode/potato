import React from 'react';
import { CheckSquare, Square, Loader2, FileText, History, Trash, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { GitHubContent } from '../../../types';

interface TrashTableProps {
  paginatedPosts: GitHubContent[];
  selectedItems: string[];
  processing: boolean;
  canRestore: boolean;
  canDelete: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onToggleSelect: (sha: string) => void;
  onToggleSelectAll: () => void;
  onRestore: (post: GitHubContent) => void;
  onDeleteRequest: (post: GitHubContent) => void;
  onPageChange: (page: number) => void;
}

const TrashTable: React.FC<TrashTableProps> = ({
  paginatedPosts,
  selectedItems,
  processing,
  canRestore,
  canDelete,
  error,
  currentPage,
  totalPages,
  onToggleSelect,
  onToggleSelectAll,
  onRestore,
  onDeleteRequest,
  onPageChange
}) => {
  const isAllSelected = paginatedPosts.length > 0 && selectedItems.length === paginatedPosts.length;

  return (
    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-5 md:px-8 py-5 w-10 hidden xl:table-cell">
                <button onClick={onToggleSelectAll} className="p-1 hover:bg-foreground/10 rounded-lg transition text-foreground/40">
                  {isAllSelected ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                </button>
              </th>
              <th className="px-5 md:px-8 py-5">Title</th>
              <th className="px-5 md:px-8 py-5 hidden md:table-cell">Path</th>
              <th className="px-5 md:px-8 py-5 text-right hidden xl:table-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-card-foreground">
            {processing && (
              <tr>
                <td colSpan={4} className="py-12 align-middle text-center">
                  <div className="flex items-center justify-center gap-3 text-indigo-500 font-bold">
                    <Loader2 className="animate-spin" size={20} />
                    Processing items...
                  </div>
                </td>
              </tr>
            )}
            {!processing && paginatedPosts.map((post) => (
              <tr 
                key={post.sha} 
                onClick={() => onToggleSelect(post.sha)}
                className={cn(
                  "hover:bg-foreground/5 transition group cursor-pointer",
                  selectedItems.includes(post.sha) ? "bg-indigo-500/10 border-l-4 border-indigo-500" : "border-l-4 border-transparent"
                )}
              >
                <td className="px-5 md:px-8 py-5 w-10 hidden xl:table-cell">
                  <button onClick={(e) => { e.stopPropagation(); onToggleSelect(post.sha); }} className="p-1 hover:bg-foreground/10 rounded-lg transition text-foreground/40">
                    {selectedItems.includes(post.sha) ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                  </button>
                </td>
                <td className="px-5 md:px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl transition hidden xs:block",
                      selectedItems.includes(post.sha) ? "bg-indigo-500 text-white" : "bg-input-bg text-foreground/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                    )}>
                      <FileText size={18} />
                    </div>
                    <span className={cn(
                      "font-semibold font-mono transition truncate max-w-[120px] md:max-w-none",
                      selectedItems.includes(post.sha) ? "text-indigo-600" : "text-foreground/80 group-hover:text-indigo-600"
                    )}>{post.name}</span>
                  </div>
                </td>
                <td className="px-5 md:px-8 py-5 text-foreground/40 hidden md:table-cell font-mono text-xs">{post.path}</td>
                <td className="px-5 md:px-8 py-5 text-right hidden xl:table-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestore(post); }}
                      disabled={!canRestore}
                      className={cn(
                        "p-2 rounded-xl transition",
                        canRestore
                          ? "text-foreground/20 hover:text-indigo-600 hover:bg-indigo-500/10"
                          : "opacity-20 cursor-not-allowed text-foreground/40"
                      )}
                      title={canRestore ? "Restore Post" : "No Permission"}
                    >
                      <History size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteRequest(post); }}
                      disabled={!canDelete}
                      className={cn(
                        "p-2 rounded-xl transition",
                        canDelete
                          ? "text-foreground/20 hover:text-red-600 hover:bg-red-500/10"
                          : "opacity-20 cursor-not-allowed text-foreground/40"
                      )}
                      title={canDelete ? "Delete Permanently" : "No Permission"}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedPosts.length === 0 && !error && !processing && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-foreground/5 text-foreground/20 rounded-[2rem] flex items-center justify-center mx-auto">
                    <Trash2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Trash is empty</h3>
                    <p className="text-sm opacity-40 text-foreground">Items you delete will appear here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-border flex justify-between items-center bg-foreground/5 mt-auto">
        <span className="text-xs text-foreground/40 font-medium">Page {currentPage} of {totalPages || 1}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-card border border-border rounded-xl disabled:opacity-50 hover:bg-foreground/5 transition text-foreground active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 bg-card border border-border rounded-xl disabled:opacity-50 hover:bg-foreground/5 transition text-foreground active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrashTable;
