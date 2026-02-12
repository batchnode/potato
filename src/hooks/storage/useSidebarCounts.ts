import { useState, useEffect } from 'react';
import type { GitHubContent } from '../../types';
import { useConfig } from './useConfig';
import { useUser } from './useUser';

export function useSidebarCounts() {
    const config = useConfig();
    const user = useUser();
    const [counts, setCounts] = useState({ drafts: 0, trash: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            if (!config.repo) return;

            try {
                const t = Date.now();
                const [dRes, rRes, tRes] = await Promise.all([
                    fetch(`/api/drafts?type=draft&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } }),
                    fetch(`/api/drafts?type=pending&t=${t}`, { headers: { 'x-user-id': user?.email || 'anonymous' } }),
                    fetch(`/api/github_contents?repo=${config.repo}&path=_trash&branch=${config.branch}&t=${t}`)
                ]);

                let draftsCount = 0;
                let reviewsCount = 0;
                let trashCount = 0;

                if (dRes.ok) {
                    const data = await dRes.json();
                    draftsCount = Array.isArray(data) ? data.length : 0;
                }
                if (rRes.ok) {
                    const data = await rRes.json();
                    reviewsCount = Array.isArray(data) ? data.length : 0;
                }
                if (tRes.ok) {
                    const data = await tRes.json();
                    if (Array.isArray(data)) trashCount = data.filter((f: GitHubContent) => f.name !== '.keep').length;
                }
                setCounts({ drafts: draftsCount + reviewsCount, trash: trashCount });
            } catch (err: unknown) {
                console.error("Failed to fetch sidebar counts", err);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 60000); // Refresh every minute

        window.addEventListener('potato_config_updated', fetchCounts);
        return () => {
            clearInterval(interval);
            window.removeEventListener('potato_config_updated', fetchCounts);
        };
    }, [config.repo, config.branch, user?.email]);

    return counts;
}
