import React from 'react';
import { Shield, Github, Activity, CircleCheck, ShieldAlert } from 'lucide-react';
import type { Config } from '../../../types';

interface SecurityTabProps {
  config: Config;
  githubInfo: {
    rateLimit?: { remaining: number; limit: number };
    valid: boolean;
  } | null;
  handleUpdatePAT: () => void;
  handleReinitialize: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  config,
  githubInfo,
  handleUpdatePAT,
  handleReinitialize,
}) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <header className="flex items-center gap-4 mb-10">
      <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><Shield size={24} /></div>
      <div><h3 className="font-bold text-xl text-foreground">Security</h3><p className="text-sm opacity-60 text-foreground">Credentials and Token management</p></div>
    </header>

    <div className="p-6 bg-secondary-bg rounded-[2rem] border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm text-foreground/40 shrink-0"><Github size={24} /></div>
        <div className="min-w-0"><p className="text-sm font-bold text-foreground">GitHub PAT</p><p className="text-xs opacity-40 text-foreground font-mono truncate max-w-full">{config.pat || '••••••••'}</p></div>
      </div>
      <button onClick={handleUpdatePAT} className="px-8 py-3.5 bg-foreground text-background rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg active:scale-95 w-full md:w-auto shrink-0">Update PAT</button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-foreground/40 mb-3"><Activity size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Rate Limit</span></div>
        <p className="text-xl md:text-2xl font-black text-foreground">{githubInfo?.rateLimit?.remaining || 0} <span className="text-xs md:text-sm opacity-40 font-normal">/ {githubInfo?.rateLimit?.limit || 5000}</span></p>
      </div>
      <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-foreground/40 mb-3"><CircleCheck size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Status</span></div>
        <p className={`text-sm md:text-base font-black uppercase tracking-wider ${githubInfo?.valid ? 'text-green-600' : 'text-red-600'}`}>{githubInfo?.valid ? 'Authenticated' : 'Invalid Token'}</p>
      </div>
    </div>

    <div className="p-10 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 mt-8 text-center space-y-4">
      <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
      <div>
        <h4 className="text-lg font-bold text-red-500">Danger Zone</h4>
        <p className="text-sm text-red-500/60 max-w-sm mx-auto">This action will wipe your configuration and disconnect the CMS from your Cloudflare KV.</p>
      </div>
      <button onClick={handleReinitialize} className="px-8 py-3.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-500/20 active:scale-95">Re-Initialize System</button>
    </div>
  </div>
);

export default SecurityTab;
