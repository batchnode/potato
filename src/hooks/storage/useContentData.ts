import { useState, useEffect, useCallback } from 'react';
import type { GitHubContent } from '../../types';
import { useConfig } from './useConfig';

export function useContentData() {
    const config = useConfig();
    const [posts, setPosts] = useState<GitHubContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = useCallback(async () => {
        if (!config.repo) {
            // We don't check for PAT anymore as it's handled server-side
            setError("Configuration missing (Repo).");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const postsDir = config.postsDir || '_posts';
            const proxyUrl = `/api/github_contents?repo=${config.repo}&path=${postsDir}&branch=${config.branch}`;
            // No custom headers needed, credentials handled by cookie/server
            const response = await fetch(proxyUrl);
            const data = await response.json();

            const filtered = (Array.isArray(data) ? data : []).filter((f: any) => f.name !== '.keep');
            setPosts(filtered);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.repo, config.pat, config.branch, config.postsDir]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    return { posts, loading, error, refresh: fetchContent };
}
