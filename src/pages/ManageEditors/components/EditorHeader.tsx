import React from 'react';
import { UserPlus } from 'lucide-react';

interface EditorHeaderProps {
  onAddClick: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ onAddClick }) => {
  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div>
        <h1 className="text-xl font-bold text-foreground leading-tight">Manage Editors</h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Configure system access</p>
      </div>
      <button
        onClick={onAddClick}
        className="hidden xl:flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        <UserPlus size={16} /> Add New Editor
      </button>
    </header>
  );
};

export default EditorHeader;
