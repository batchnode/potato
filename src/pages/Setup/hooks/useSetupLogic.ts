import { useState, useCallback, useMemo } from 'react';
import type { Config } from '../../../types';
import type { SetupStep } from '../components/SetupProgressBar';

export interface SetupFormData extends Config {
  email?: string;
  password?: string;
  schemaType?: string;
}

interface SetupLogicProps {
  // onComplete removed as it's no longer used here
}

export const useSetupLogic = ({ }: SetupLogicProps) => {
  const [step, setStep] = useState<SetupStep>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<SetupFormData>({
    email: '',
    password: '',
    pat: '',
    repo: '',
    branch: '',
    postsDir: '_posts',
    assetsDir: 'public/images',
    websiteUrl: 'https://mysite.com',
    schemaType: 'default'
  });

  const fetchRepos = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch repositories. Check your PAT.');
      const data = await response.json() as { full_name: string }[];
      setRepos(data.map((r) => r.full_name));
      setStep('github-repo');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = useCallback(async (repo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/branches`, {
        headers: {
          'Authorization': `Bearer ${formData.pat!.trim()}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch branches.');
      const data = await response.json() as { name: string }[];
      const branchNames = data.map((b) => b.name);
      setBranches(branchNames);
      const defaultBranch = branchNames.find((b: string) => b === 'main' || b === 'master') || branchNames[0];
      setFormData(prev => ({ ...prev, branch: defaultBranch }));
      setStep('github-branch');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  }, [formData.pat]);

  const handleNext = async () => {
    if (step === 'github-auth') {
      if (!formData.pat || formData.pat.length < 10) {
        setError('Please enter a valid GitHub PAT');
        return;
      }
      fetchRepos(formData.pat);
      return;
    }
    if (step === 'github-repo') {
      if (!formData.repo) return;
      fetchBranches(formData.repo);
      return;
    }

    if (step === 'schema') {
      setLoading(true);
      try {
        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save to KV. Is potato_kv bound?');

        const configToSave = {
          ...formData,
          configuredAt: new Date().toISOString()
        };
        localStorage.setItem('potato_config', JSON.stringify(configToSave));
        setStep('engine-init');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Setup failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (step === 'admin') setStep('cloudflare');
      else if (step === 'cloudflare') setStep('github-auth');
      else if (step === 'github-branch') setStep('content');
      else if (step === 'content') setStep('schema');
    }, 800);
  };

  const filteredRepos = useMemo(() => 
    repos.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())),
    [repos, searchTerm]
  );

  return {
    step,
    setStep,
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
  };
};
