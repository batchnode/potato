import React from 'react';
import { 
  Files, 
  Users, 
  Image as ImageIcon, 
  Database, 
  Github, 
  Cloud,
  ArrowUpRight,
  Zap,
  Activity,
  Settings,
  Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardBentoProps {
  filesCount: number;
  draftsCount: number;
  reviewCount: number;
  editorsCount: number;
  mediaCount: number;
  branch: string;
  infraStats: { d1_sync_count: number; kv_keys_count: number };
}

const DashboardBento: React.FC<DashboardBentoProps> = ({ 
  filesCount, 
  draftsCount, 
  reviewCount, 
  editorsCount, 
  mediaCount,
  branch,
  infraStats
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 px-2">
      {/* ... (previous tiles) */}
      
      {/* Content Overview Tile */}
      <div className="md:col-span-2 lg:col-span-3 p-8 bg-card border border-border rounded-[3rem] shadow-sm flex flex-col justify-between group hover:border-indigo-500/20 transition-all duration-500">
        <div className="flex justify-between items-start">
          <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
            <Files size={32} />
          </div>
          <button 
            onClick={() => navigate('/content')}
            className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <ArrowUpRight size={20} />
          </button>
        </div>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h3 className="text-6xl font-black text-foreground tracking-tighter">{filesCount}</h3>
            <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-2">Published Content</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{draftsCount} Drafts</p>
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{reviewCount} Pending</p>
          </div>
        </div>
      </div>

      {/* Media Tile */}
      <div className="md:col-span-2 lg:col-span-3 p-8 bg-card border border-border rounded-[3rem] shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-500">
        <div className="flex justify-between items-start">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
            <ImageIcon size={32} />
          </div>
          <button 
            onClick={() => navigate('/media')}
            className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <ArrowUpRight size={20} />
          </button>
        </div>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h3 className="text-6xl font-black text-foreground tracking-tighter">{mediaCount}</h3>
            <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-2">Assets Optimized</p>
          </div>
          <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/10 backdrop-blur-sm">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Library Live</p>
          </div>
        </div>
      </div>

      {/* Team Snapshot Tile */}
      <div className="md:col-span-2 lg:col-span-2 p-8 bg-sidebar text-sidebar-foreground rounded-[3rem] shadow-xl flex flex-col justify-between group border border-sidebar-border hover:border-indigo-500/30 transition-all duration-500">
        <div className="flex justify-between items-start">
          <div className="p-4 bg-white/5 rounded-[1.5rem] group-hover:rotate-12 transition-transform duration-500">
            <Users size={28} />
          </div>
          <button 
            onClick={() => navigate('/editors')}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-4xl font-black">{editorsCount}</h3>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Active Editors</p>
        </div>
      </div>

      {/* System Health Tile */}
      <div className="md:col-span-2 lg:col-span-2 p-8 bg-indigo-600 text-white rounded-[3rem] shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="flex justify-between items-start relative z-10">
          <div className="p-4 bg-white/20 rounded-[1.5rem]">
            <Cloud size={28} />
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
            Live
          </div>
        </div>
        <div className="mt-6 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Edge Sync Status</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Github size={14} className="opacity-60" />
              <span className="text-xs font-bold truncate">Branch: {branch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={14} className="opacity-60" />
              <span className="text-xs font-bold">KV Core Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Infrastructure Counts Tile */}
      <div className="md:col-span-2 lg:col-span-2 p-8 bg-card border border-border rounded-[3rem] shadow-sm flex flex-col justify-between group hover:border-orange-500/20 transition-all duration-500">
        <div className="flex items-center gap-2 text-foreground/40 mb-2">
          <Activity size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Engine Deep-Sync</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">
              <span>SQL D1 Index</span>
              <span className="text-orange-500">{infraStats.d1_sync_count} Rows</span>
            </div>
            <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500/40 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">
              <span>KV Core Keys</span>
              <span className="text-indigo-500">{infraStats.kv_keys_count} Active</span>
            </div>
            <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500/40 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
           <p className="text-[9px] font-bold text-foreground/20 leading-tight italic">Real-time counts fetched from Cloudflare backend binding metadata.</p>
        </div>
      </div>

      {/* Quick Actions Tile */}
      <div className="md:col-span-4 lg:col-span-2 p-8 bg-card border border-border rounded-[3rem] shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-foreground/40 mb-4">
          <Activity size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Global Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/settings')}
            className="p-4 bg-foreground/5 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-[1.5rem] transition-all duration-300 flex flex-col items-center gap-2 group"
          >
            <Zap size={20} className="opacity-40 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
          </button>
          <button 
            onClick={() => navigate('/trash')}
            className="p-4 bg-foreground/5 hover:bg-red-500/10 hover:text-red-600 rounded-[1.5rem] transition-all duration-300 flex flex-col items-center gap-2 group"
          >
            <Trash size={20} className="opacity-40 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Trash</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardBento;