import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useUser, useConfig, useMediaData } from '../../../hooks/useStorage';
import type { GitHubContent } from '../../../types';

export const useMediaLibraryLogic = () => {
  const user = useUser();
  const config = useConfig();
  const [currentPath, setCurrentPath] = useState<string>('');
  const { assets: allAssets, loading, error, refresh: fetchMedia } = useMediaData(currentPath);
  const [selectedAsset, setSelectedAsset] = useState<GitHubContent | null>(null);

  const assets = useMemo(() => {
    return allAssets.filter(asset => asset.type === 'file' && asset.name !== '.keep');
  }, [allAssets]);

  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuSide, setMenuSide] = useState<'left' | 'right'>('right');
  const [lastWorkflow, setLastWorkflow] = useState<any>(null);

  const fetchWorkflowStatus = useCallback(async () => {
    if (!config.repo) return;
    try {
      const res = await fetch('/api/github_workflow_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          workflow_id: 'webp-converter.yml'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastWorkflow(data);
      }
    } catch (e) {
      console.error("Failed to fetch workflow status", e);
    }
  }, [config.repo]);

  useEffect(() => {
    fetchWorkflowStatus();
    const interval = setInterval(() => {
      if (lastWorkflow?.status === 'in_progress' || lastWorkflow?.status === 'queued') {
        fetchWorkflowStatus();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchWorkflowStatus, lastWorkflow?.status]);

  useEffect(() => {
    setSelectedAsset(null);
  }, [currentPath]);

  const handleSelect = useCallback((asset: GitHubContent) => {
    setSelectedAsset(prev => prev?.sha === asset.sha ? null : asset);
  }, []);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'danger' | 'success';
    confirmLabel?: string;
    showInput?: boolean;
    onConfirm: () => void;
  }>({ 
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [modalInput, setModalInput] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateIn = useCallback((folderName: string) => {
    setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
  }, []);

  const navigateOut = useCallback(() => {
    setCurrentPath(prev => {
      const parts = prev.split('/');
      parts.pop();
      return parts.join('/');
    });
  }, []);

  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    return ['Root', ...parts];
  }, [currentPath]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config.repo) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const result = reader.result as string;
      const base64Content = result.split(',')[1];
      const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
      const fullPath = currentPath ? `${basePath}/${currentPath}` : basePath;
      try {
        const response = await fetch('/api/github_upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: config.repo,
            path: fullPath,
            branch: config.branch,
            filename: file.name,
            content: base64Content
          })
        });
        if (!response.ok) throw new Error('Upload failed');
        setToast({ message: "File uploaded successfully!", type: 'success' });
        fetchMedia();
      } catch (err: unknown) {
        setToast({ message: err instanceof Error ? err.message : "Upload failed", type: 'error' });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const executeDelete = useCallback(async (asset: GitHubContent) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
      const fullPath = currentPath ? `${basePath}/${currentPath}` : basePath;
      const response = await fetch('/api/github_delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: fullPath,
          branch: config.branch,
          filename: asset.name,
          sha: asset.sha
        })
      });
      if (!response.ok) throw new Error('Deletion failed');
      setToast({ message: "Asset successfully deleted", type: 'success' });
      fetchMedia();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Deletion failed", type: 'error' });
    }
  }, [config.repo, config.assetsDir, config.branch, currentPath, fetchMedia]);

  const executeRename = useCallback(async (asset: GitHubContent, newName: string) => {
    if (!newName || newName === asset.name) {
      setModal(prev => ({ ...prev, isOpen: false }));
      return;
    }
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
      const fullPath = currentPath ? `${basePath}/${currentPath}` : basePath;
      const response = await fetch('/api/github_rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: fullPath,
          branch: config.branch,
          oldName: asset.name,
          newName: newName,
          sha: asset.sha
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Rename failed');
      setToast({ message: "Asset renamed successfully", type: 'success' });
      fetchMedia();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Rename failed", type: 'error' });
    }
  }, [config.repo, config.assetsDir, config.branch, currentPath, fetchMedia]);

  const createFolder = useCallback(async (name: string) => {
    if (!name) return;
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const basePath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
      const folderPath = currentPath ? `${basePath}/${currentPath}/${name}` : `${basePath}/${name}`;
      
      const response = await fetch('/api/github_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: folderPath,
          branch: config.branch,
          filename: '.keep',
          content: btoa('This file ensures the folder is tracked by Git.'),
          message: `Create folder: ${name}`
        })
      });
      if (!response.ok) throw new Error('Failed to create folder');
      setToast({ message: "Folder created successfully!", type: 'success' });
      fetchMedia();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Failed to create folder", type: 'error' });
    }
  }, [config.repo, config.assetsDir, config.branch, currentPath, fetchMedia]);

  const openCreateFolderModal = useCallback(() => {
    setModalInput('');
    setModal({
      isOpen: true,
      title: 'Create New Folder',
      message: 'Enter a name for the new directory.',
      type: 'info',
      confirmLabel: 'Create Folder',
      showInput: true,
      onConfirm: () => {} 
    });
  }, []);

  const handleDownload = useCallback((asset: GitHubContent) => {
    const link = document.createElement('a');
    link.href = asset.download_url;
    link.download = asset.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Download started", type: 'success' });
    setActiveMenu(null);
  }, []);

  const openRenameModal = useCallback((asset: GitHubContent) => {
    setModalInput(asset.name);
    setModal({
      isOpen: true,
      title: 'Rename Asset',
      message: 'Renaming may break link references in your posts.',
      type: 'info',
      confirmLabel: 'Rename Asset',
      showInput: true,
      onConfirm: () => {} 
    });
    setActiveMenu(null);
  }, []);

  const openDeleteModal = useCallback((asset: GitHubContent) => {
    setModal({
      isOpen: true,
      title: 'Delete Asset',
      message: `Are you sure you want to permanently delete "${asset.name}"? This cannot be undone.`,
      type: 'danger',
      confirmLabel: 'Delete Permanently',
      onConfirm: () => executeDelete(asset)
    });
    setActiveMenu(null);
  }, [executeDelete]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeMenu === id) {
      setActiveMenu(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const screenWidth = window.innerWidth;
      setMenuSide(rect.left < screenWidth / 2 ? 'left' : 'right');
      setActiveMenu(id);
    }
  }, [activeMenu]);

  const installWebPAction = async () => {
    if (!config.repo) return;
    try {
      const res = await fetch('/actions/webp-converter.yml');
      const yaml = await res.text();
      const base64Content = btoa(unescape(encodeURIComponent(yaml)));
      
      const uploadRes = await fetch('/api/github_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: '.github/workflows',
          branch: config.branch,
          filename: 'webp-converter.yml',
          content: base64Content,
          message: "Setup: Add WebP conversion workflow"
        })
      });
      
      if (!uploadRes.ok) throw new Error("Failed to install workflow");
      setToast({ message: "WebP Action installed successfully!", type: 'success' });
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Installation failed", type: 'error' });
    }
  };

  const triggerWebPConversion = async () => {
    if (!config.repo) return;
    try {
      const dispatchRes = await fetch('/api/github_dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          branch: config.branch,
          workflow_id: 'webp-converter.yml',
          inputs: {
            assets_dir: config.assetsDir || 'assets'
          }
        })
      });
      
      const data = await dispatchRes.json();
      if (!dispatchRes.ok) {
        if (data.message?.includes("Not Found")) {
          throw new Error("Workflow not found. Please install it first.");
        }
        throw new Error(data.message || "Failed to trigger conversion");
      }
      setToast({ message: "Conversion started! Check GitHub Actions for progress.", type: 'success' });
      fetchWorkflowStatus();
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "Trigger failed", type: 'error' });
    }
  };

  return {
    user,
    config,
    assets,
    loading,
    error,
    fetchMedia,
    uploading,
    toast,
    setToast,
    activeMenu,
    setActiveMenu,
    menuSide,
    modal,
    setModal,
    modalInput,
    setModalInput,
    menuRef,
    fileInputRef,
    toggleMenu,
    handleUpload,
    handleDownload,
    executeRename,
    executeDelete,
    openRenameModal,
    openDeleteModal,
    currentPath,
    setCurrentPath,
    selectedAsset,
    handleSelect,
    navigateIn,
    navigateOut,
    breadcrumbs,
    createFolder,
    openCreateFolderModal,
    installWebPAction,
    triggerWebPConversion,
    lastWorkflow,
    fetchWorkflowStatus
  };
};
