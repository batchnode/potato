import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Database, 
  Github, 
  Zap,
  Layout
} from 'lucide-react';

interface WorkbenchBentoProps {
  draftCount: number;
  reviewCount: number;
  foldersInitialized: boolean;
}

const WorkbenchBento: React.FC<WorkbenchBentoProps> = ({ draftCount, reviewCount, foldersInitialized }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 px-2">
      {/* Drafts Pulse */}
      <div className="md:col-span-2 lg:col-span-2 p-6 bg-card border border-border rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-indigo-500/20 transition-colors">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded-lg">Drafting</span>
        </div>
        <div className="mt-4">
          <h3 className="text-4xl font-black text-foreground">{draftCount}</h3>
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Total Drafts</p>
        </div>
      </div>

      {/* Review Tile */}
      <div className="md:col-span-2 lg:col-span-2 p-6 bg-card border border-border rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-amber-500/20 transition-colors">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-lg">Review</span>
        </div>
        <div className="mt-4">
          <h3 className="text-4xl font-black text-foreground">{reviewCount}</h3>
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Pending Approval</p>
        </div>
      </div>

      {/* System Status Bento Tile */}
      <div className="md:col-span-2 lg:col-span-2 p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex justify-between items-start relative z-10">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Layout size={24} />
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="mt-4 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Engine Status</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Github size={14} className="opacity-60" />
              <span className="text-xs font-bold">Synced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database size={14} className="opacity-60" />
              <span className="text-xs font-bold">KV Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Alert Tile - Only show if not fully ready */}
      {!foldersInitialized && (
        <div className="md:col-span-4 lg:col-span-6 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-600 rounded-2xl">
              <Zap size={24} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-amber-600">Infrastructure Required</h4>
              <p className="text-xs font-medium text-amber-600/60 mt-0.5">Initialize repository folders to start drafting.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkbenchBento;
