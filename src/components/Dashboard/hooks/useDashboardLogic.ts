import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser, useConfig, useDashboardData } from '../../../hooks/useStorage';

export const useDashboardLogic = () => {
  const user = useUser();
  const config = useConfig();
  const { files, drafts, reviewItems, loading: contentLoading, error, refresh } = useDashboardData();
  const [editorsCount, setEditorsCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [infraStats, setInfraStats] = useState({ d1_sync_count: 0, kv_keys_count: 0 });
  const [loading, setLoading] = useState(true);

  const [preview, setPreview] = useState<{ isOpen: boolean; filename: string; sourceDir: string }>({
    isOpen: false,
    filename: '',
    sourceDir: ''
  });

  const fetchExtraStats = useCallback(async () => {
    if (!config.repo) return;
    try {
      const [edRes, medRes, infraRes] = await Promise.all([
        fetch('/api/editors'),
        fetch(`/api/github_contents?repo=${config.repo}&path=${config.assetsDir || 'assets'}&branch=${config.branch}`),
        fetch('/api/infrastructure_stats')
      ]);
      
      if (edRes.ok) {
        const editors = await edRes.json();
        setEditorsCount(editors.length + 1); // +1 for the base admin
      }
      
      if (medRes.ok) {
        const media = await medRes.json();
        setMediaCount(Array.isArray(media) ? media.filter((m: any) => m.type === 'file' && m.name !== '.keep').length : 0);
      }

      if (infraRes.ok) {
        const stats = await infraRes.json();
        setInfraStats(stats);
      }
    } catch (e) {
      console.error("Failed to fetch extra dashboard stats", e);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchExtraStats();
  }, [fetchExtraStats]);

  const displayRole = useMemo(() => 
    user?.role === 'Administrator' ? 'Admin' : user?.role || '',
    [user?.role]
  );

  return {
    user,
    config,
    files,
    drafts,
    reviewItems,
    editorsCount,
    mediaCount,
    infraStats,
    loading: contentLoading || loading,
    error,
    refresh,
    preview,
    setPreview,
    displayRole
  };
};