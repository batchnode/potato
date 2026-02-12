import React from 'react';
import { GitBranch } from 'lucide-react';
import RepoItem from '../RepoItem';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface GitHubBranchStepProps {
  branches: string[];
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
}

const GitHubBranchStep: React.FC<GitHubBranchStepProps> = ({ branches, formData, setFormData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
          <GitBranch size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Select Branch</h1>
        <p className="text-slate-500 mt-1">Target branch for {formData.repo}</p>
      </header>
      <div className="max-h-64 overflow-y-auto pr-2 space-y-2 no-scrollbar">
        {branches.map((branch) => (
          <div key={branch} onClick={() => setFormData({ ...formData, branch })}>
            <RepoItem name={branch} active={formData.branch === branch} icon={<GitBranch size={14} />} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubBranchStep;
