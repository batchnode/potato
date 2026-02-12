import { useState, useEffect, useCallback } from 'react';
import yaml from 'js-yaml';
import { useUser } from '../../../hooks/useStorage';

interface UsePreviewLogicProps {
  isOpen: boolean;
  filename: string;
  repo: string;
  pat: string;
  branch: string;
  sourceDir: string;
}

export const usePreviewLogic = ({
  isOpen,
  filename,
  repo,
  pat,
  branch,
  sourceDir
}: UsePreviewLogicProps) => {
  const user = useUser();
  const [content, setContent] = useState('');
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!isOpen || !filename || !repo) return;
    
    setLoading(true);
    setError(null);

    try {
      let rawContent = '';
      const isKVSource = sourceDir === '_drafts' || sourceDir === '_review';

      if (isKVSource) {
        const userId = user?.email || 'anonymous';
        const type = sourceDir === '_drafts' ? 'draft' : 'pending';
        const kvKey = `${type}:${userId}:${filename}`;
        
        const response = await fetch(`/api/drafts?path=${kvKey}`);
        if (!response.ok) throw new Error('Failed to fetch draft from KV storage');
        
        const data = await response.json();
        rawContent = data.content || '';
      } else {
        const cleanDir = sourceDir.replace(/^\/+|\/+$/g, '');
        const proxyUrl = `/api/github_contents?repo=${repo}&path=${cleanDir}/${filename}&branch=${branch}`;
        
        const response = await fetch(proxyUrl, {
          headers: { 'x-github-token': pat }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch content');

        const fileData = Array.isArray(data) ? data[0] : data;
        const base64 = fileData.content.replace(/\s/g, '');
        rawContent = new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
      }

      const fmMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

      if (fmMatch) {
        try {
          const parsed = yaml.load(fmMatch[1]);
          setFrontmatter(parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {});
          setContent(fmMatch[2] || '');
        } catch {
          setFrontmatter({});
          setContent(rawContent);
        }
      } else {
        setFrontmatter({});
        setContent(rawContent);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [isOpen, filename, repo, pat, branch, sourceDir, user?.email]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const getImageUrl = useCallback((src: string) => {
    if (!src) return '';
    const isExternal = src.startsWith('http') || src.startsWith('data:');
    if (isExternal) return src;
    
    const cleanPath = src.startsWith('/') ? src.substring(1) : src;
    return `/api/media_proxy?repo=${repo}&branch=${branch}&path=${cleanPath}`;
  }, [repo, branch]);

  const renderValue = useCallback((val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) return val.toLocaleDateString();
    if (Array.isArray(val)) return val.map(v => renderValue(v)).join(', ');
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return '[Complex Object]';
      }
    }
    return String(val);
  }, []);

  const fm = frontmatter || {};
  const tags = Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : []);
  const categories = Array.isArray(fm.categories) ? fm.categories : (fm.categories ? [fm.categories] : []);

  const title = renderValue(fm.title) || filename;
  const description = renderValue(fm.description);
  const thumbnail = renderValue(fm.thumbnail);

  return {
    content,
    frontmatter,
    fm,
    loading,
    error,
    isFullscreen,
    setIsFullscreen,
    getImageUrl,
    renderValue,
    tags,
    categories,
    title,
    description,
    thumbnail
  };
};
