import React from 'react';
import { Loader2, Send, ShieldCheck } from 'lucide-react';

interface PostHeaderProps {
  isEditing: boolean;
  filename?: string;
  isPublishing: boolean;
  canEditPublished: boolean;
  sourceFolder: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSubmitForReview: () => void;
  isDraft: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  isEditing,
  filename,
  isPublishing,
  canEditPublished,
  sourceFolder,
  onSaveDraft,
  onPublish,
  onSubmitForReview,
  isDraft
}) => {
  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{isEditing ? 'Edit Post' : 'Create Post'}</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{isEditing ? filename : 'Drafting'}</p>
        </div>
      </div>
      <div className="hidden xl:flex items-center gap-2">
        {(!isEditing || isDraft || sourceFolder === '_review') && (
          <button
            onClick={onSaveDraft}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground/60 rounded-xl hover:text-foreground transition font-bold text-xs active:scale-95 disabled:opacity-50"
          >
            Save Draft
          </button>
        )}

        {canEditPublished ? (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
          >
            {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            <span>{isEditing && sourceFolder !== '_drafts' && sourceFolder !== '_review' ? 'Update' : 'Publish'}</span>
          </button>
        ) : (
          <button
            onClick={onSubmitForReview}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95"
          >
            {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            <span>Submit for Review</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default PostHeader;
