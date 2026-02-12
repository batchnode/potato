import React from 'react';
import { ShieldCheck, Mail, Trash2 } from 'lucide-react';
import { CompactPermissionItem } from './PermissionSwitch';
import type { Editor } from '../../../types';

interface EditorCardProps {
  editors: Editor[];
  onTogglePermission: (id: string, field: keyof Editor) => void;
  onDelete: (editor: Editor) => void;
}

const EditorCard: React.FC<EditorCardProps> = ({ editors, onTogglePermission, onDelete }) => {
  return (
    <div className="lg:hidden divide-y divide-border/50">
      {editors.map((editor) => (
        <div key={editor.id} className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40">
                {editor.role === 'Administrator' ? <ShieldCheck size={20} className="text-indigo-600" /> : <Mail size={18} />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground/80 truncate max-w-[150px] xs:max-w-[200px] sm:max-w-md">{editor.email}</p>
                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">{editor.role === 'Administrator' ? 'Admin' : 'Editor'}</p>
              </div>
            </div>
            {editor.role !== 'Administrator' && (
              <button
                onClick={() => onDelete(editor)}
                className="p-2.5 text-red-500/40 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-row items-center justify-between gap-2 pt-2 overflow-x-auto no-scrollbar">
            <CompactPermissionItem
              label="Review"
              active={editor.requireReview}
              onClick={() => onTogglePermission(editor.id, 'requireReview')}
              disabled={editor.role === 'Administrator'}
            />
            <CompactPermissionItem
              label="Delete"
              active={editor.canDelete}
              onClick={() => onTogglePermission(editor.id, 'canDelete')}
              disabled={editor.role === 'Administrator'}
            />
            <CompactPermissionItem
              label="Publish"
              active={editor.canEditPublished}
              onClick={() => onTogglePermission(editor.id, 'canEditPublished')}
              disabled={editor.role === 'Administrator'}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditorCard;
