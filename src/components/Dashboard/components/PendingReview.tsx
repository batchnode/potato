import React from 'react';
import { ShieldCheck } from 'lucide-react';
import ContentRow from './ContentRow';
import type { GitHubContent } from '../../../types';

interface PendingReviewProps {
  items: GitHubContent[];
  onEdit: (name: string) => void;
  onPreview: (name: string) => void;
}

const PendingReview: React.FC<PendingReviewProps> = ({ items, onEdit, onPreview }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2">
          <ShieldCheck size={20} /> Pending Review
        </h3>
      </div>
      <div className="bg-card rounded-[2.5rem] border-2 border-amber-500/20 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-amber-500/10 text-card-foreground">
            {items.map((item) => (
              <ContentRow
                key={item.sha}
                filename={item.name}
                status="Waiting Review"
                warning
                onEdit={() => onEdit(item.name)}
                onPreview={() => onPreview(item.name)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PendingReview;
