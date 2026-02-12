import React from 'react';
import { FolderPlus, Loader2, ShieldCheck } from 'lucide-react';

interface InfrastructureInitProps {
  onInitialize: () => void;
  initializing: boolean;
}

const InfrastructureInit: React.FC<InfrastructureInitProps> = ({ onInitialize, initializing }) => {
  return (
    <div className="bg-card p-10 md:p-16 rounded-[3rem] border border-border shadow-sm text-center space-y-6 mx-2">
      <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-2 relative">
        <FolderPlus size={36} />
        <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Prepare Workspace</h2>
        <p className="text-sm opacity-60 text-foreground max-w-md mx-auto leading-relaxed font-medium">
          Your repository needs <code>_drafts</code> and <code>_review</code> folders to enable the content lifecycle.
        </p>
      </div>
      <button
        onClick={onInitialize}
        disabled={initializing}
        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-3 mx-auto active:scale-95 w-full sm:w-auto justify-center"
      >
        {initializing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
        Initialize Infrastructure
      </button>
    </div>
  );
};

export default InfrastructureInit;
