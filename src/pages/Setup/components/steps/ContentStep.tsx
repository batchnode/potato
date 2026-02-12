import React from 'react';
import { Folder } from 'lucide-react';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface ContentStepProps {
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
}

const ContentStep: React.FC<ContentStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
          <Folder size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Content Structure</h1>
        <p className="text-slate-500 mt-2">Define your repository directory mapping.</p>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Posts Folder</label>
          <input
            type="text"
            value={formData.postsDir}
            onChange={(e) => setFormData({ ...formData, postsDir: e.target.value })}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none font-mono focus:ring-2 focus:ring-indigo-500/10 transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assets Folder</label>
          <input
            type="text"
            value={formData.assetsDir}
            onChange={(e) => setFormData({ ...formData, assetsDir: e.target.value })}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none font-mono focus:ring-2 focus:ring-indigo-500/10 transition"
          />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Website URL (Optional)</label>
        <input
          type="url"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          placeholder="https://my-blog.com"
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
        />
      </div>
    </div>
  );
};

export default ContentStep;
