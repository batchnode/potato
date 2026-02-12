import React from 'react';
import { PermissionToggle } from './PermissionSwitch';
import type { NewEditor } from '../hooks/useManageEditorsLogic';

interface AddEditorModalProps {
  show: boolean;
  onClose: () => void;
  newEditor: NewEditor;
  setNewEditor: (data: NewEditor) => void;
  onAdd: () => void;
}

const AddEditorModal: React.FC<AddEditorModalProps> = ({ show, onClose, newEditor, setNewEditor, onAdd }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border relative z-10 p-6 md:p-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">New Member</h2>
        <p className="text-sm text-foreground/40 mb-6 md:mb-8 font-medium">Create a new editor account with custom permissions.</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block ml-1">Email Address</label>
            <input
              type="email"
              value={newEditor.email}
              onChange={e => setNewEditor({ ...newEditor, email: e.target.value })}
              className="w-full px-5 py-3.5 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
              placeholder="editor@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block ml-1">Temporary Password</label>
            <input
              type="password"
              value={newEditor.password}
              onChange={e => setNewEditor({ ...newEditor, password: e.target.value })}
              className="w-full px-5 py-3.5 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
              placeholder="••••••••••••"
            />
          </div>
          <div className="pt-4 border-t border-border space-y-4">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block ml-1">Initial Permissions</label>
            <div className="grid grid-cols-2 gap-3">
              <PermissionToggle
                label="Review Protocol"
                active={newEditor.requireReview}
                onClick={() => setNewEditor({ ...newEditor, requireReview: !newEditor.requireReview })}
              />
              <PermissionToggle
                label="Allow Delete"
                active={newEditor.canDelete}
                onClick={() => setNewEditor({ ...newEditor, canDelete: !newEditor.canDelete })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-foreground/5 text-foreground/60 hover:bg-foreground/10 rounded-2xl font-bold text-sm transition active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditorModal;
