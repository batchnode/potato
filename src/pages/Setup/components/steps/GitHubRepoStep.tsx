import React from 'react';
import { Github, Search } from 'lucide-react';
import RepoItem from '../RepoItem';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface GitHubRepoStepProps {
  repos: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
  filteredRepos: string[];
}

const GitHubRepoStep: React.FC<GitHubRepoStepProps> = ({ repos, searchTerm, setSearchTerm, formData, setFormData, filteredRepos }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          <Github size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Select Repository</h1>
        <p className="text-slate-500 mt-1">Found {repos.length} repositories.</p>
      </header>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search repos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2 no-scrollbar">
          {filteredRepos.map((repo) => (
            <div key={repo} onClick={() => setFormData({ ...formData, repo })}>
              <RepoItem name={repo} active={formData.repo === repo} icon={<Github size={14} />} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubRepoStep;
