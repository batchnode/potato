import { useState, useEffect, useCallback } from 'react';
import type { Editor } from '../../types';
import { useConfig } from './useConfig';

export function useEditorsData() {
    const config = useConfig();
    const [editors, setEditors] = useState<Editor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEditors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/editors');
            if (res.ok) {
                const data = await res.json();
                const baseAdmin: Editor = {
                    id: '0',
                    email: config.email || 'admin@potato.io',
                    role: 'Administrator',
                    requireReview: false,
                    canDelete: true,
                    canEditPublished: true,
                    joined: 'System'
                };
                setEditors([baseAdmin, ...data.filter((e: Editor) => e.email !== baseAdmin.email)]);
            } else {
                throw new Error("Failed to fetch editors");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [config.email]);

    useEffect(() => {
        fetchEditors();
    }, [fetchEditors]);

    const saveEditors = async (newEditors: Editor[]) => {
        const editorsToSave = newEditors.filter(e => e.role !== 'Administrator');
        try {
            const res = await fetch('/api/editors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editorsToSave)
            });
            if (!res.ok) throw new Error("Failed to save editors");
            setEditors(newEditors);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const deleteEditor = async (id: string) => {
        try {
            const res = await fetch(`/api/editors?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete editor");
            setEditors(prev => prev.filter(e => e.id !== id));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return { editors, loading, error, refresh: fetchEditors, saveEditors, deleteEditor };
}
