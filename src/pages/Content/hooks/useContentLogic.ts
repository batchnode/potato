import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useConfig, useContentData } from '../../../hooks/useStorage';
import type { User } from '../../../types';

export const useContentLogic = () => {
  const user = useUser();
  const config = useConfig();
  const { posts, loading, error, refresh: fetchContent } = useContentData();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
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
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [preview, setPreview] = useState<{ isOpen: boolean; filename: string; sourceDir: string }>({
    isOpen: false,
    filename: '',
    sourceDir: (config.postsDir || '_posts').replace(/^\/+|\/+$/g, '')
  });
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      post.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const canDelete = !!(user?.role === 'Administrator' || (user as User & { isAdmin?: boolean })?.isAdmin || (user as User & { canDelete?: boolean })?.canDelete);
  const canEditPublished = !!(user?.role === 'Administrator' || (user as User & { isAdmin?: boolean })?.isAdmin || (user as User & { canEditPublished?: boolean })?.canEditPublished);

  const toggleSelect = useCallback((sha: string) => {
    setSelectedPosts(prev =>
      prev.includes(sha) ? prev.filter(s => s !== sha) : [...prev, sha]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedPosts.length === paginatedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(paginatedPosts.map(p => p.sha));
    }
  }, [selectedPosts.length, paginatedPosts]);

  const handleBulkAction = useCallback(async (action: 'delete' | 'trash') => {
    if (selectedPosts.length === 0) return;

    setModal({
      isOpen: true,
      title: action === 'trash' ? "Move to Trash" : "Delete Permanently",
      message: `Are you sure you want to ${action} ${selectedPosts.length} selected posts?`,
      type: action === 'trash' ? 'info' : 'danger',
      confirmLabel: action === 'trash' ? "Move to Trash" : "Delete Selected",
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        setBulkProcessing(true);
        try {
          const selectedItems = posts.filter(p => selectedPosts.includes(p.sha));

          for (const item of selectedItems) {
            if (action === 'trash') {
              await fetch('/api/github_move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  repo: config.repo,
                  branch: config.branch,
                  filename: item.name,
                  sourceDir: (config.postsDir || '').replace(/^\/+|\/+$/g, ''),
                  targetDir: '_trash'
                })
              });
            } else {
              await fetch(`/api/github_delete?repo=${config.repo}&path=${item.path}&branch=${config.branch}`, {
                method: 'DELETE'
              });
            }
          }

          setToast({ message: `Successfully ${action === 'trash' ? 'trashed' : 'deleted'} ${selectedPosts.length} posts`, type: 'success' });
          setSelectedPosts([]);
          fetchContent();
        } catch {
          setToast({ message: `Failed to ${action} some posts`, type: 'error' });
        } finally {
          setBulkProcessing(false);
        }
      }
    });
  }, [selectedPosts, posts, config, fetchContent]);

  return {
    user,
    config,
    posts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedPosts,
    setSelectedPosts,
    toast,
    setToast,
    modal,
    setModal,
    bulkProcessing,
    preview,
    setPreview,
    itemsPerPage,
    navigate,
    filteredPosts,
    totalPages,
    paginatedPosts,
    canDelete,
    canEditPublished,
    toggleSelect,
    toggleSelectAll,
    handleBulkAction
  };
};
