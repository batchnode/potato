import { useState, useEffect, useCallback } from 'react';
import type { GitHubContent } from '../../types';
import { useUser } from './useUser';
import { useConfig } from './useConfig';

export function useDashboardData() {
    const config = useConfig();
    const user = useUser();
    const [files, setFiles] = useState<GitHubContent[]>([]);
    const [drafts, setDrafts] = useState<GitHubContent[]>([]);
    const [reviewItems, setReviewItems] = useState<GitHubContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = useCallback(async () => {
        if (!config.repo) {
            setError("GitHub configuration is incomplete.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const postsPath = (config.postsDir || '').replace(/^\/+|\/+$/g, '');
            const postsRes = await fetch(`/api/github_contents?repo=${config.repo}&path=${postsPath}&branch=${config.branch}`);
            const postsData = await postsRes.json();

            if (postsRes.ok) {
                setFiles(Array.isArray(postsData) ? postsData : []);
            } else {
                throw new Error(postsData.error || "Failed to fetch posts");
            }

            // Fetch WIP from KV Engine
            const t = Date.now();
            const [draftsRes, reviewRes] = await Promise.all([
                fetch(`/api/drafts?type=draft&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } }),
                fetch(`/api/drafts?type=pending&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } })
            ]);

            if (draftsRes.ok) {
                const data = await draftsRes.json();
                setDrafts(data.map((item: any) => ({
                    name: item.filename,
                    path: item.path,
                    sha: item.id,
                    type: 'file',
                    isKV: true
                })));
            } else {
                setDrafts([]);
            }

            if (reviewRes.ok) {
                const data = await reviewRes.json();
                setReviewItems(data.map((item: any) => ({
                    name: item.filename,
                    path: item.path,
                    sha: item.id,
                    type: 'file',
                    isKV: true
                })));
            } else {
                setReviewItems([]);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.repo, config.postsDir, config.branch, user?.isAdmin, user?.email]);

    useEffect(() => {
        if (config.repo) {
            fetchContent();
        } else {
            setLoading(false);
        }
    }, [config.repo, fetchContent]);

    return { files, drafts, reviewItems, loading, error, refresh: fetchContent };
}
