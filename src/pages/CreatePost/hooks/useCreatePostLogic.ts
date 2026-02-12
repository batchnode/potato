import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import yaml from 'js-yaml';
import { useUser, useConfig } from '../../../hooks/useStorage';
import type { GitHubContent, User } from '../../../types';

export const useCreatePostLogic = () => {
  const { filename } = useParams<{ filename?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const config = useConfig();

  const isEditing = !!filename;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [fileSha, setFileSha] = useState<string | null>(null);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isDraft = queryParams.get('draft') === 'true';
  const sourceFolder = queryParams.get('source') || (isDraft ? '_drafts' : (config.postsDir || '_posts').replace(/^\/+|\/+$/g, ''));
  const isKVSource = sourceFolder === '_drafts' || sourceFolder === '_review';

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = !!(user?.role === 'Administrator' || (user as User & { isAdmin?: boolean })?.isAdmin);
  const canEditPublished = !!(isAdmin || (user as User & { canEditPublished?: boolean })?.canEditPublished);
  const isUnauthorizedEdit = isEditing && !isDraft && !canEditPublished;

  const [libraryAssets, setLibraryAssets] = useState<GitHubContent[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const normalizeFormData = useCallback((data: Record<string, unknown>): Record<string, unknown> => {
    const normalized = { ...data };

    Object.keys(normalized).forEach(key => {
      const value = normalized[key];

      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        normalized[key] = `${year}-${month}-${day}`;
      }
      else if (typeof value === 'string' && (key.toLowerCase().includes('date') || key === 'updated' || key === 'created')) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              normalized[key] = `${year}-${month}-${day}`;
            }
          } catch {
            // Keep original value
          }
        }
      }
    });

    return normalized;
  }, []);

  const savedSchema = localStorage.getItem('potato_schema') || `title: "string"
description: "string"
date: "date"
author: "string"
thumbnail: "image"
tags: "list"
categories: "list"
draft: "boolean"
layout: "string"`;

  const parsedSchema = useMemo(() => {
    try {
      const loaded = yaml.load(savedSchema);
      return (typeof loaded === 'object' && loaded !== null) ? loaded as Record<string, unknown> : {};
    } catch { return {}; }
  }, [savedSchema]);

  useEffect(() => {
    if (!filename) {
      setContent('');
      setFormData({});
      setFileSha(null);
      setLoading(false);
    }
  }, [location.pathname, filename]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (content || Object.keys(formData).length > 0) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [content, formData]);

  const fetchFileContent = useCallback(async () => {
    if (!isEditing || !filename || !config.repo) return;
    setLoading(true);
    
    try {
      let rawContent = '';
      let sha = '';

      if (isKVSource) {
          // Fetch from KV
          const userId = user?.email || 'anonymous';
          const kvKey = `${sourceFolder === '_drafts' ? 'draft' : 'pending'}:${userId}:${filename}`;
          const response = await fetch(`/api/drafts?path=${kvKey}`);
          if (!response.ok) {
              // WIP folders are now exclusively in KV
              throw new Error('Failed to fetch from KV Engine');
          } else {
              const data = await response.json();
              rawContent = data.content;
              sha = data.id;
          }
      } else {
          // Fetch from GitHub (Production)
          const proxyUrl = `/api/github_contents?repo=${config.repo}&path=${sourceFolder}/${filename}&branch=${config.branch}`;
          const response = await fetch(proxyUrl, { 
            headers: { 'x-github-token': config.pat } 
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to fetch file');
          const fileData = Array.isArray(data) ? data[0] : data;
          sha = fileData.sha;
          const base64 = fileData.content.replace(/\s/g, '');
          rawContent = new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
      }

      setFileSha(sha);
      const fmMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
      if (fmMatch) {
        const parsedData = yaml.load(fmMatch[1]) as Record<string, unknown>;
        const normalizedData = normalizeFormData(parsedData);
        setFormData(normalizedData);
        setContent(fmMatch[2] || '');
      } else {
        setContent(rawContent);
      }
    } catch (err: unknown) {
      console.error(err);
      setToast({ message: "Failed to load content. It may have been moved or deleted.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isEditing, filename, config.pat, config.repo, config.branch, sourceFolder, normalizeFormData, isKVSource, user?.email]);

  useEffect(() => {
    fetchFileContent();
  }, [fetchFileContent]);

  const applyFormatting = useCallback((prefix: string, suffix: string = '', defaultText: string = '', block: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    let selectedText = textarea.value.substring(start, end) || defaultText;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    if (block) {
      const lines = selectedText.split('\n');
      selectedText = lines.map(line => `${prefix}${line}`).join('\n');
      prefix = '';
    }
    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop;
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, []);

  const fetchLibrary = async () => {
    if (!config.repo || !config.pat || loadingLibrary) return;
    setLoadingLibrary(true);
    const cleanPath = (config.assetsDir || '').replace(/^\/+|\/+$/g, '');
    const proxyUrl = `/api/github_contents?repo=${config.repo}&path=${cleanPath}&branch=${config.branch}`;
    try {
      const response = await fetch(proxyUrl);
      const data = await response.json();
      setLibraryAssets(Array.isArray(data) ? data : []);
      setShowMediaBrowser(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleSave = async (mode: 'draft' | 'review' | 'publish') => {
    if (!config.repo) return;

    let targetFilename = filename;
    if (!isEditing) {
      const title = formData.title as string | undefined;
      const slugInput = formData.slug as string | undefined;
      const slug = slugInput || title?.toLowerCase().replace(/\s+/g, '-') || `post-${Date.now()}`;
      targetFilename = slug.endsWith('.md') ? slug : `${slug}.md`;
    }

    setIsPublishing(true);
    try {
      const normalizedFormData = normalizeFormData(formData);
      const frontmatter = yaml.dump(normalizedFormData);
      const fullFileContent = `---\n${frontmatter}---\n\n${content}`;
      const base64Content = btoa(unescape(encodeURIComponent(fullFileContent)));

      if (mode === 'draft' || mode === 'review') {
        // 1. Save to KV Engine (Local-first Private)
        const draftRes = await fetch('/api/drafts', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.email || 'anonymous'
          },
          body: JSON.stringify({
            repo: config.repo,
            path: config.postsDir,
            filename: targetFilename,
            content: fullFileContent,
            type: mode === 'draft' ? 'draft' : 'pending',
            mirror_to_github: false // No longer mirroring WIP
          })
        });

        if (!draftRes.ok) throw new Error('Failed to save to KV Engine');

        // Optional: Mirror to GitHub if configured
        const shouldMirror = (mode === 'draft' && config.saveDraftsToGithub) || (mode === 'review' && config.saveReviewsToGithub);
        if (shouldMirror) {
            const mirrorPath = mode === 'draft' ? '_drafts' : '_review';
            await fetch('/api/github_upload', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-github-token': config.pat
                }, // Backend handles auth via cookie
                body: JSON.stringify({
                    repo: config.repo,
                    path: mirrorPath,
                    branch: config.branch,
                    filename: targetFilename,
                    content: base64Content,
                    message: `Backup ${mode}: ${targetFilename}`
                })
            });
        }

      } else {
        // mode === 'publish'
        let targetDir = (config.postsDir || '_posts').replace(/^\/+|\/+$/g, '');
        const isMovingFromGitHub = isEditing && !isKVSource && sourceFolder !== targetDir;

        const response = await fetch('/api/github_upload', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-github-token': config.pat
          },
          body: JSON.stringify({
            repo: config.repo,
            path: targetDir,
            branch: config.branch,
            filename: targetFilename,
            content: base64Content,
            sha: isMovingFromGitHub ? null : fileSha,
            message: `Publish ${targetFilename}`
          })
        });

        if (!response.ok) throw new Error('Failed to push to GitHub');

        if (isMovingFromGitHub && fileSha) {
          await fetch(`/api/github_delete?repo=${config.repo}&path=${sourceFolder}/${filename}&branch=${config.branch}`, {
            method: 'DELETE'
          });
        }
        
        // If it was in KV Engine, delete it from KV
        if (isKVSource) {
           const kvKey = `${sourceFolder === '_drafts' ? 'draft' : 'pending'}:${user?.email || 'anonymous'}:${filename}`;
           await fetch(`/api/drafts?path=${kvKey}`, { method: 'DELETE' });
        }
      }

      setToast({
        message: mode === 'publish' ? "Published!" : (mode === 'review' ? "Submitted for review!" : "Draft Saved!"),
        type: 'success'
      });

      localStorage.removeItem(`potato_draft_${filename || 'new'}`);
      setTimeout(() => navigate(mode === 'publish' ? '/content' : '/workbench'), 1500);
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : "An unknown error occurred", type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Content = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/github_upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: config.repo,
            path: config.assetsDir,
            branch: config.branch,
            filename: `${Date.now()}-${file.name}`,
            content: base64Content
          })
        });
        const data = await res.json() as { content: { download_url: string }; error?: string };
        if (!res.ok) throw new Error(data.error);
        applyFormatting(`![${file.name}](${data.content.download_url})`, '');
        setToast({ message: "Image uploaded!", type: 'success' });
      } catch (err: unknown) {
        setToast({ message: err instanceof Error ? err.message : "Upload failed", type: 'error' });
      } finally {
        setUploading(false);
      }
    };
  };

  return {
    filename,
    isEditing,
    textareaRef,
    fileInputRef,
    content,
    setContent,
    formData,
    setFormData,
    loading,
    uploading,
    isPublishing,
    showMobilePreview,
    setShowMobilePreview,
    showMediaBrowser,
    setShowMediaBrowser,
    toast,
    setToast,
    isDraft,
    sourceFolder,
    canEditPublished,
    isUnauthorizedEdit,
    libraryAssets,
    parsedSchema,
    config,
    user,
    applyFormatting,
    fetchLibrary,
    handleSave,
    handleFileUpload,
    navigate
  };
};
