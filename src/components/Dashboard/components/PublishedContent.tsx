import React from 'react';
import ContentRow from './ContentRow';
import type { GitHubContent } from '../../../types';

interface PublishedContentProps {
  files: GitHubContent[];
  onEdit: (name: string) => void;
  onPreview: (name: string) => void;
}

const PublishedContent: React.FC<PublishedContentProps> = ({ files, onEdit, onPreview }) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-foreground">Published Content</h3>
      </div>
      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-foreground/40 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-5 md:px-8 py-4">Filename</th>
              <th className="px-5 md:px-8 py-4 hidden sm:table-cell">Status</th>
              <th className="px-5 md:px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-card-foreground">
            {files.slice(0, 10).map((file) => (
              <ContentRow
                key={file.sha}
                filename={file.name}
                status="Live"
                onEdit={() => onEdit(file.name)}
                onPreview={() => onPreview(file.name)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PublishedContent;
