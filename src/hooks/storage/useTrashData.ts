import { useState, useEffect, useCallback } from 'react';
import type { GitHubContent } from '../../types';
import { useConfig } from './useConfig';

export function useTrashData() {
    const config = useConfig();
    const [trashItems, setTrashItems] = useState<GitHubContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrash = useCallback(async () => {
        if (!config.repo) {
            setError("Configuration missing.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const proxyUrl = `/api/github_contents?repo=${config.repo}&path=_trash&branch=${config.branch}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (response.status === 404) {
                setTrashItems([]);
            } else if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch trash');
            } else {
                const filtered = (Array.isArray(data) ? data : []).filter(f => f.name !== '.keep');
                setTrashItems(filtered);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.repo, config.pat, config.branch]);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    return { trashItems, loading, error, refresh: fetchTrash };
}
