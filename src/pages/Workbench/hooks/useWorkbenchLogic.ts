import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useConfig, useWorkbenchData } from '../../../hooks/useStorage';
import type { GitHubContent, User } from '../../../types';

export type TabType = 'drafts' | 'review';

export const useWorkbenchLogic = () => {
  const user = useUser();
  const config = useConfig();
  const { drafts, reviewItems, loading, error: fetchError, foldersInitialized, refresh: fetchWorkbench } = useWorkbenchData();

  const [initializing, setInitializing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
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
  const [preview, setPreview] = useState<{ isOpen: boolean; filename: string; sourceDir: string }>({
    isOpen: false,
    filename: '',
    sourceDir: ''
  });

  const [activeTab, setActiveTab] = useState<TabType>('drafts');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const activeItems = activeTab === 'drafts' ? drafts : reviewItems;
  const sourceDir = activeTab === 'drafts' ? '_drafts' : '_review';

  const filteredItems = useMemo(() => {
    return activeItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeItems, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]); // Clear selection when tab or search changes
  }, [activeTab, searchTerm]);

  const isAdmin = !!(user?.role === 'Administrator' || (user as User & { isAdmin?: boolean })?.isAdmin);
  const canPublish = !!(isAdmin || ((user?.role === 'Editor') && (user as User & { canEditPublished?: boolean })?.canEditPublished));

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelect = useCallback((sha: string) => {
    setSelectedItems(prev =>
      prev.includes(sha) ? prev.filter(s => s !== sha) : [...prev, sha]
    );
  }, []);

  const syncWithD1 = useCallback(async () => {
    if (!config.repo || !config.pat) return;
    try {
      const folders = [config.postsDir || '_posts'];
      for (const path of folders) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.email || 'anonymous'
          },
          body: JSON.stringify({
            repo: config.repo,
            path: path,
            branch: config.branch || 'main'
          })
        });
      }
    } catch (e) {
      console.error('D1 Sync failed:', e);
    }
  }, [config, user?.email]);

  useEffect(() => {
    if (foldersInitialized) {
      syncWithD1();
    }
  }, [foldersInitialized, syncWithD1]);

  const handleAction = useCallback((item: GitHubContent, action: 'submit' | 'approve' | 'delete') => {
    let title = "";
    let message = "";
    let confirmLabel = "";
    let type: 'info' | 'danger' | 'success' = 'info';

    if (action === 'submit') {
      title = "Submit for Review";
      message = `Are you sure you want to submit "${item.name}" for review? This will move it to the shared review folder.`;
      confirmLabel = "Submit Now";
    } else if (action === 'approve') {
      title = "Approve & Publish";
      message = `Are you sure you want to publish "${item.name}"? This will move it to the live production folder.`;
      confirmLabel = "Publish Now";
      type = 'success';
    } else if (action === 'delete') {
      title = "Delete Draft";
      message = `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`;
      confirmLabel = "Delete Permanently";
      type = 'danger';
    }

    setModal({
      isOpen: true,
      title,
      message,
      type,
      confirmLabel,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        setProcessing(item.sha); // sha stores the KV key
        try {
          if (action === 'delete') {
            await fetch(`/api/drafts?path=${item.sha}`, { method: 'DELETE' });
          } else if (action === 'submit') {
            // Update KV record from 'draft' to 'pending'
            const getRes = await fetch(`/api/drafts?path=${item.sha}`);
            const { content } = await getRes.json();
            
            await fetch('/api/drafts', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-id': user?.email || 'anonymous'
              },
              body: JSON.stringify({
                repo: config.repo,
                filename: item.name,
                content: content,
                type: 'pending'
              })
            });
            // Cleanup the draft key
            await fetch(`/api/drafts?path=${item.sha}`, { method: 'DELETE' });
          } else if (action === 'approve') {
            // Move from KV Pending to GitHub Production
            const getRes = await fetch(`/api/drafts?path=${item.sha}`);
            const { content } = await getRes.json();
            
            const targetDir = (config.postsDir || '_posts').replace(/^\/+|\/+$/g, '');
            const base64Content = btoa(unescape(encodeURIComponent(content)));

            const res = await fetch('/api/github_upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                repo: config.repo,
                path: targetDir,
                branch: config.branch,
                filename: item.name,
                content: base64Content,
                message: `Publish ${item.name}`
              })
            });
            if (!res.ok) throw new Error("Failed to upload to GitHub");
            
            // Cleanup the pending key from KV
            await fetch(`/api/drafts?path=${item.sha}`, { method: 'DELETE' });
          }

          setToast({
            message: action === 'delete' ? "Deleted!" : (action === 'submit' ? "Submitted for review!" : "Published!"),
            type: 'success'
          });
          fetchWorkbench();
          setSelectedItems([]);
        } catch (err: unknown) {
          setToast({ message: err instanceof Error ? err.message : "An error occurred", type: 'error' });
        } finally {
          setProcessing(null);
        }
      }
    });
  }, [config, fetchWorkbench]);

  const copyGuides = async () => {
    if (!config.repo) return;
    setInitializing(true);
    const templateNames = ['workbench.md', 'publishing.md', 'media.md'];

    try {
      // 0. Refresh D1 Schema (Drop & Recreate Tables)
      await fetch('/api/setup?scope=d1_only', { method: 'DELETE' });
      await fetch('/api/initialize_engine', { method: 'POST' });

      const folders = ['_drafts', '_review', '_trash'];
      // 1. Ensure folders exist on GitHub (Sequentially to avoid conflicts)
      for (const folder of folders) {
        const res = await fetch('/api/github_upload', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-github-token': config.pat
          },
          body: JSON.stringify({
            repo: config.repo,
            path: folder,
            branch: config.branch || 'main',
            filename: '.keep',
            content: btoa('This file ensures the folder is tracked by Git.'),
            message: `Initialize Infrastructure: Add .keep to ${folder}`
          })
        });
        if (!res.ok) {
          const err = await res.json() as any;
          // Ignore 409/422 if it means file already exists, otherwise throw
          if (res.status !== 409 && res.status !== 422) {
             throw new Error(err.error || `Failed to create ${folder}`);
          }
        }
      }

      // 2. Copy templates to KV Engine ONLY
      for (const fileName of templateNames) {
        try {
          const res = await fetch(`/templates/${fileName}`);
          if (!res.ok) {
            console.error(`Could not find template ${fileName}`);
            continue;
          }
          const text = await res.text();

          // Save to KV Engine (via drafts API)
          const draftRes = await fetch('/api/drafts', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': user?.email || 'anonymous'
            },
            body: JSON.stringify({
              repo: config.repo,
              path: '_drafts',
              filename: fileName,
              content: text,
              type: 'draft',
              mirror_to_github: false
            })
          });

          if (!draftRes.ok) {
            const errData = await draftRes.json();
            console.error(`Failed to save ${fileName} to KV:`, errData.error);
          } else {
            console.log(`Successfully initialized ${fileName} in KV`);
          }
        } catch (e) {
          console.error(`Failed to initialize template ${fileName}:`, e);
        }
      }

      setToast({ message: "Infrastructure initialized with guides!", type: 'success' });
      await fetchWorkbench();
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to initialize workbench", type: 'error' });
    } finally {
      setInitializing(false);
    }
  };

  return {
    user,
    config,
    drafts,
    reviewItems,
    loading,
    fetchError,
    foldersInitialized,
    fetchWorkbench,
    initializing,
    processing,
    toast,
    setToast,
    modal,
    setModal,
    preview,
    setPreview,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedItems,
    toggleSelect,
    itemsPerPage,
    navigate,
    sourceDir,
    filteredItems,
    canPublish,
    totalPages,
    paginatedItems,
    handleAction,
    copyGuides
  };
};
