import React from 'react';
import { Edit3 } from 'lucide-react';
import ContentRow from './ContentRow';
import type { GitHubContent } from '../../../types';

interface RecentDraftsProps {
  drafts: GitHubContent[];
  onEdit: (name: string) => void;
  onPreview: (name: string) => void;
}

const RecentDrafts: React.FC<RecentDraftsProps> = ({ drafts, onEdit, onPreview }) => {
  if (drafts.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-foreground/80 flex items-center gap-2">
          <Edit3 size={20} /> My Recent Drafts
        </h3>
      </div>
      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-border/50 text-card-foreground">
            {drafts.slice(0, 5).map((draft) => (
              <ContentRow
                key={draft.sha}
                filename={draft.name}
                status="Draft"
                warning={false}
                onEdit={() => onEdit(draft.name)}
                onPreview={() => onPreview(draft.name)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentDrafts;
