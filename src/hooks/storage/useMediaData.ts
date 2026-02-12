import { useState, useEffect, useCallback } from 'react';
import type { GitHubContent } from '../../types';
import { useConfig } from './useConfig';

export function useMediaData(overridePath?: string) {
    const config = useConfig();
    const [assets, setAssets] = useState<GitHubContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedia = useCallback(async () => {
        if (!config.repo || !config.assetsDir) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const basePath = config.assetsDir.replace(/^\/+|\/+$/g, '');
        const cleanPath = overridePath ? `${basePath}/${overridePath.replace(/^\/+|\/+$/g, '')}`.replace(/\/+$/, '') : basePath;
        
        const proxyUrl = `/api/github_contents?repo=${config.repo}&path=${cleanPath}&branch=${config.branch}`;
        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Fetch failed');
            setAssets(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.repo, config.pat, config.assetsDir, config.branch, overridePath]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    return { assets, loading, error, refresh: fetchMedia };
}
