import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useSetupLogic } from './Setup/hooks/useSetupLogic';
import SetupProgressBar from './Setup/components/SetupProgressBar';
import AdminStep from './Setup/components/steps/AdminStep';
import GitHubAuthStep from './Setup/components/steps/GitHubAuthStep';
import GitHubRepoStep from './Setup/components/steps/GitHubRepoStep';
import GitHubBranchStep from './Setup/components/steps/GitHubBranchStep';
import CloudflareStep from './Setup/components/steps/CloudflareStep';
import ContentStep from './Setup/components/steps/ContentStep';
import SchemaStep from './Setup/components/steps/SchemaStep';
import EngineInitStep from './Setup/components/steps/EngineInitStep';

interface SetupProps {
  onComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const {
    step,
    loading,
    error,
    setError,
    repos,
    branches,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    handleNext,
    filteredRepos
  } = useSetupLogic({});

  const inputClasses = "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <img src="/potato.png" alt="Potato Logo" className="w-12 h-12 object-contain" />
          <span className="font-bold text-3xl tracking-tight text-slate-900">Potato</span>
        </div>

        <SetupProgressBar step={step} />

        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 md:p-14">

            {step === 'admin' && (
              <AdminStep 
                formData={formData} 
                setFormData={setFormData} 
                inputClasses={inputClasses} 
              />
            )}

            {step === 'github-auth' && (
              <GitHubAuthStep 
                formData={formData} 
                setFormData={setFormData} 
                error={error} 
                setError={setError} 
                inputClasses={inputClasses} 
              />
            )}

            {step === 'github-repo' && (
              <GitHubRepoStep 
                repos={repos} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                formData={formData} 
                setFormData={setFormData} 
                filteredRepos={filteredRepos} 
              />
            )}

            {step === 'github-branch' && (
              <GitHubBranchStep 
                branches={branches} 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {step === 'cloudflare' && (
              <CloudflareStep />
            )}

            {step === 'content' && (
              <ContentStep 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {step === 'schema' && (
              <SchemaStep 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {step === 'engine-init' && (
              <EngineInitStep onComplete={() => {
                onComplete();
                navigate('/');
              }} />
            )}

            {step !== 'engine-init' && (
              <div className="mt-12">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>{step === 'schema' ? 'Finish Configuration' : 'Continue'} <ArrowRight size={20} /></>}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center mt-8 text-xs text-slate-400">Potato Deployment Assistant • v1.0.0</p>
      </div>
    </div>
  );
};

export default Setup;