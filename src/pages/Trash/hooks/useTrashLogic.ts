import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser, useConfig, useTrashData } from '../../../hooks/useStorage';
import type { GitHubContent, User } from '../../../types';

export const useTrashLogic = () => {
  const user = useUser();
  const config = useConfig();
  const { trashItems, loading, error, refresh: fetchTrash } = useTrashData();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'danger' | 'success';
    confirmLabel?: string;
    onConfirm: () => void;
  }>({ 
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [processing, setProcessing] = useState(false);
  const itemsPerPage = 10;

  const filteredPosts = useMemo(() => {
    return trashItems.filter(post =>
      post.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trashItems, searchTerm]);

  const paginatedPosts = useMemo(() => 
    filteredPosts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredPosts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
  }, [searchTerm]);

  const toggleSelect = useCallback((sha: string) => {
    setSelectedItems(prev =>
      prev.includes(sha) ? prev.filter(s => s !== sha) : [...prev, sha]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === paginatedPosts.length && paginatedPosts.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedPosts.map(p => p.sha));
    }
  }, [selectedItems.length, paginatedPosts]);

  const handleRestore = useCallback(async (post: GitHubContent) => {
    setProcessing(true);
    try {
      const postsDir = (config.postsDir || '').replace(/^\/+|\/+$/g, '');
      const res = await fetch('/api/github_move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          branch: config.branch,
          filename: post.name,
          sourceDir: '_trash',
          targetDir: postsDir,
          message: `Restore: ${post.name}`
        })
      });
      if (!res.ok) throw new Error("Failed to restore post");
      setToast({ message: "Post restored successfully!", type: 'success' });
      fetchTrash();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Restore failed", type: 'error' });
    } finally {
      setProcessing(false);
    }
  }, [config, fetchTrash]);

  const executeDelete = useCallback(async (post: GitHubContent) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    setProcessing(true);
    try {
      const res = await fetch(`/api/github_delete?repo=${config.repo}&path=${post.path}&branch=${config.branch}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete post permanently");
      setToast({ message: "Post deleted permanently.", type: 'success' });
      fetchTrash();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Delete failed", type: 'error' });
    } finally {
      setProcessing(false);
    }
  }, [config, fetchTrash]);

  const handleEmptyTrash = useCallback(() => {
    setModal({
      isOpen: true,
      title: "Empty Trash",
      message: "Are you sure you want to permanently delete ALL items in the trash? This action cannot be undone.",
      type: "danger",
      confirmLabel: "Empty Trash",
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        setProcessing(true);
        try {
          for (const post of trashItems) {
            await fetch(`/api/github_delete?repo=${config.repo}&path=${post.path}&branch=${config.branch}`, {
              method: 'DELETE'
            });
          }
          setToast({ message: "Trash emptied!", type: 'success' });
          fetchTrash();
        } catch {
          setToast({ message: "Failed to empty trash", type: 'error' });
        } finally {
          setProcessing(false);
        }
      }
    });
  }, [trashItems, config, fetchTrash]);

  const userObj = user as User & { canDelete?: boolean; canEditPublished?: boolean };
  const canDelete = !!(user?.role === 'Administrator' || user?.isAdmin || userObj?.canDelete);
  const canRestore = !!(user?.role === 'Administrator' || user?.isAdmin || userObj?.canEditPublished);

  return {
    user,
    config,
    trashItems,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedItems,
    setSelectedItems,
    toast,
    setToast,
    modal,
    setModal,
    processing,
    paginatedPosts,
    totalPages,
    handleRestore,
    executeDelete,
    handleEmptyTrash,
    canDelete,
    canRestore,
    toggleSelect,
    toggleSelectAll
  };
};