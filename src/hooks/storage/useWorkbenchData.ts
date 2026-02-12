import { useState, useEffect, useCallback } from 'react';
import type { GitHubContent } from '../../types';
import { useConfig } from './useConfig';
import { useUser } from './useUser';

export function useWorkbenchData() {
    const config = useConfig();
    const user = useUser();
    const [drafts, setDrafts] = useState<GitHubContent[]>([]);
    const [reviewItems, setReviewItems] = useState<GitHubContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [foldersInitialized, setFoldersInitialized] = useState(true);

    const fetchWorkbench = useCallback(async () => {
        if (!config.repo) {
            setError("Configuration missing.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const t = Date.now();
            const [dRes, rRes] = await Promise.all([
                fetch(`/api/drafts?type=draft&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } }),
                fetch(`/api/drafts?type=pending&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } })
            ]);

            // Check if folders exist (to show initialize button)
            const checkRes = await fetch(`/api/github_contents?repo=${config.repo}&path=_drafts&branch=${config.branch}`, {
                headers: { 'x-github-token': config.pat }
            });
            if (checkRes.status === 404) {
                setFoldersInitialized(false);
            } else {
                setFoldersInitialized(true);
            }

            if (dRes.ok) {
                const data = await dRes.json();
                // Map KV results to GitHubContent-like objects
                setDrafts(data.map((item: any) => ({
                    name: item.filename,
                    path: item.path,
                    sha: item.id, // Using KV key as SHA/ID
                    type: 'file',
                    isKV: true,
                    last_modified: item.last_modified
                })));
            }
            if (rRes.ok) {
                const data = await rRes.json();
                setReviewItems(data.map((item: any) => ({
                    name: item.filename,
                    path: item.path,
                    sha: item.id,
                    type: 'file',
                    isKV: true,
                    last_modified: item.last_modified
                })));
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.repo, config.branch, user?.email]);

    useEffect(() => {
        fetchWorkbench();
    }, [fetchWorkbench]);

    return { drafts, reviewItems, loading, error, foldersInitialized, refresh: fetchWorkbench };
}
