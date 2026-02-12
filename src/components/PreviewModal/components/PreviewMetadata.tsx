import React from 'react';
import { Calendar, User, FileText, Share2 } from 'lucide-react';

interface PreviewMetadataProps {
  date: string;
  author: string;
  layout: string;
  category?: string;
}

const PreviewMetadata: React.FC<PreviewMetadataProps> = ({
  date,
  author,
  layout,
  category
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-foreground/5 rounded-3xl border border-border/50">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1.5"><Calendar size={10} /> Date</span>
        <p className="text-xs font-bold text-foreground/80">{date || 'No Date'}</p>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1.5"><User size={10} /> Author</span>
        <p className="text-xs font-bold text-foreground/80">{author || 'System'}</p>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1.5"><FileText size={10} /> Layout</span>
        <p className="text-xs font-bold text-foreground/80">{layout || 'Post'}</p>
      </div>
      {category && (
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1.5"><Share2 size={10} /> Category</span>
          <p className="text-xs font-bold text-foreground/80">{category}</p>
        </div>
      )}
    </div>
  );
};

export default PreviewMetadata;
