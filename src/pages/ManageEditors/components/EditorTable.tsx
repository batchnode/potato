import React from 'react';
import { ShieldCheck, Mail, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { PermissionSwitch } from './PermissionSwitch';
import type { Editor } from '../../../types';

interface EditorTableProps {
  editors: Editor[];
  onTogglePermission: (id: string, field: keyof Editor) => void;
  onDelete: (editor: Editor) => void;
}

const EditorTable: React.FC<EditorTableProps> = ({ editors, onTogglePermission, onDelete }) => {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-foreground/5 text-foreground/40 font-bold uppercase text-[10px]">
          <tr>
            <th className="px-5 md:px-8 py-5">User</th>
            <th className="px-5 md:px-8 py-5 text-center">Review Protocol</th>
            <th className="px-5 md:px-8 py-5 text-center">Delete Perms</th>
            <th className="px-5 md:px-8 py-5 text-center">Edit Published</th>
            <th className="px-5 md:px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 text-card-foreground">
          {editors.map((editor) => (
            <tr key={editor.id} className="hover:bg-foreground/[0.02] transition group">
              <td className="px-5 md:px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition hidden xs:flex">
                    {editor.role === 'Administrator' ? <ShieldCheck size={20} className="text-indigo-600" /> : <Mail size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground/80 truncate max-w-[120px] md:max-w-none">{editor.email}</p>
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">{editor.role === 'Administrator' ? 'Admin' : 'Editor'}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 md:px-8 py-6 text-center">
                <PermissionSwitch
                  active={editor.requireReview}
                  onClick={() => onTogglePermission(editor.id, 'requireReview')}
                  disabled={editor.role === 'Administrator'}
                />
              </td>
              <td className="px-5 md:px-8 py-6 text-center">
                <PermissionSwitch
                  active={editor.canDelete}
                  onClick={() => onTogglePermission(editor.id, 'canDelete')}
                  disabled={editor.role === 'Administrator'}
                />
              </td>
              <td className="px-5 md:px-8 py-6 text-center">
                <PermissionSwitch
                  active={editor.canEditPublished}
                  onClick={() => onTogglePermission(editor.id, 'canEditPublished')}
                  disabled={editor.role === 'Administrator'}
                />
              </td>
              <td className="px-5 md:px-8 py-6 text-right">
                <button
                  onClick={() => onDelete(editor)}
                  className={cn(
                    "p-2.5 rounded-xl transition",
                    "md:opacity-0 md:group-hover:opacity-100",
                    editor.role === 'Administrator' ? "hidden" : "text-foreground/20 hover:text-red-600 hover:bg-red-500/10"
                  )}
                  title="Remove Member"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditorTable;
