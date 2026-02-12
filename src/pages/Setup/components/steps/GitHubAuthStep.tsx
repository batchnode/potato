import React from 'react';
import { Github, Key } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface GitHubAuthStepProps {
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
  error: string | null;
  setError: (err: string | null) => void;
  inputClasses: string;
}

const GitHubAuthStep: React.FC<GitHubAuthStepProps> = ({ formData, setFormData, error, setError, inputClasses }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4">
          <Github size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">GitHub Authentication</h1>
        <p className="text-slate-500 mt-2">Provide your PAT to fetch your repositories.</p>
      </header>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">GitHub PAT</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={formData.pat}
              onChange={(e) => { setError(null); setFormData({ ...formData, pat: e.target.value }); }}
              className={cn(inputClasses, "font-mono", error && "border-red-300")}
            />
          </div>
          {error && <p className="text-[10px] text-red-500 font-bold mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default GitHubAuthStep;
