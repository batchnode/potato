import { useState, useEffect, useCallback } from 'react';
import { useUser, useConfig } from '../../../hooks/useStorage';
import type { Config } from '../../../types';

export type SettingsTab = 'general' | 'github' | 'cloudflare' | 'schema' | 'security';

export interface ProfileData {
  currentPassword: string;
  newEmail: string;
  newPassword: string;
}

export const useSettingsLogic = () => {
  const user = useUser();
  const initialConfig = useConfig();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [config, setConfig] = useState<Config>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [githubInfo, setGithubInfo] = useState<{
    rateLimit?: { remaining: number; limit: number };
    valid: boolean;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('potato_theme') || 'default');
  const [profileData, setProfileData] = useState<ProfileData>({
    currentPassword: '',
    newEmail: '',
    newPassword: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

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
  const [sudoOpen, setSudoOpen] = useState(false);
  const [sudoAction, setSudoAction] = useState<() => void>(() => { });
  const [patInput, setPatInput] = useState('');
  const [schema, setSchema] = useState('');
  const [initializingDrafts, setInitializingDrafts] = useState(false);
  const [initializingTrash, setInitializingTrash] = useState(false);

  const isAdmin = user?.role === 'Administrator';

  const applyThemeLocally = useCallback((theme: string) => {
    document.body.classList.remove('theme-black', 'theme-light');
    if (theme === 'black') document.body.classList.add('theme-black');
    if (theme === 'light') document.body.classList.add('theme-light');
    localStorage.setItem('potato_theme', theme);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [configRes, ghRes] = await Promise.all([
        fetch('/api/get_config'),
        fetch('/api/github_info')
      ]);
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
        setSchema(localStorage.getItem('potato_schema') || `title: "string"
description: "string"
date: "date"
author: "string"
thumbnail: "image"
tags: "list"
categories: "list"
draft: "boolean"
layout: "string"`);
      }
      if (ghRes.ok) setGithubInfo(await ghRes.json());

      const prefsRes = await fetch(`/api/profile?email=${user.email}`);
      if (prefsRes.ok) {
        const prefs = await prefsRes.json() as { theme?: string };
        if (prefs.theme) {
          setCurrentTheme(prefs.theme);
          applyThemeLocally(prefs.theme);
        }
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, applyThemeLocally]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isAdmin && activeTab !== 'general') {
      setActiveTab('general');
    }
  }, [activeTab, isAdmin]);

  const stripMaskedPat = (configData: Config) => {
    const { pat, ...rest } = configData;
    return (pat && pat.includes('****')) ? rest : configData;
  };

  const triggerRebuild = async (reason: string) => {
    if (!user) return;
    try {
      await fetch('/api/github_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: '/',
          branch: config.branch || 'main',
          filename: 'site-rebuild.txt',
          content: btoa(`Rebuild triggered by ${user.email} due to ${reason} changes at ${new Date().toISOString()}`),
          message: `Rebuild Trigger: ${reason}`
        })
      });
      setToast({ message: "Site rebuild triggered! This may take 2-3 minutes.", type: 'success' });
    } catch (err: unknown) {
      console.error("Rebuild trigger failed", err);
    }
  };

  const handleSaveConfig = async () => {
    const oldConfigStr = localStorage.getItem('potato_config');
    const oldConfig = oldConfigStr ? JSON.parse(oldConfigStr) : {};
    const needsRebuild = config.websiteUrl !== oldConfig.websiteUrl;

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripMaskedPat(config))
      });
      if (response.ok) {
        localStorage.setItem('potato_config', JSON.stringify(config));
        window.dispatchEvent(new Event('potato_config_updated'));
        setToast({ message: "Settings saved successfully", type: 'success' });
        if (needsRebuild) triggerRebuild('Core Config');
      }
    } catch {
      setToast({ message: "Update failed", type: 'error' });
    }
  };

  const handleSaveSchema = async () => {
    localStorage.setItem('potato_schema', schema);
    setToast({ message: "Schema saved successfully", type: 'success' });
    triggerRebuild('Schema');
  };

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    applyThemeLocally(theme);
  };

  const savePreferences = async () => {
    if (!user) return;
    setIsSavingPreferences(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, theme: currentTheme })
      });
      if (res.ok) {
        setToast({ message: "Preferences saved successfully", type: 'success' });
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch {
      setToast({ message: "Failed to save preferences", type: 'error' });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    if (!profileData.currentPassword) {
      setToast({ message: "Current password is required", type: 'error' });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: profileData.currentPassword || undefined,
          newEmail: profileData.newEmail || undefined,
          newPassword: profileData.newPassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Profile updated successfully!", type: 'success' });
        setProfileData({ currentPassword: '', newEmail: '', newPassword: '' });
        if (profileData.newEmail || profileData.newPassword) {
          localStorage.setItem('potato_session', JSON.stringify({ ...user, ...data.user }));
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        setToast({ message: data.error || "Update failed", type: 'error' });
      }
    } catch {
      setToast({ message: "Network error", type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const executeSudoAction = (action: () => void) => {
    setSudoAction(() => action);
    setSudoOpen(true);
  };

  const confirmUpdatePAT = useCallback(() => {
    if (patInput.length < 10) {
      setToast({ message: "Token is too short to be valid", type: 'error' });
      return;
    }
    setModal(prev => ({ ...prev, isOpen: false }));
    executeSudoAction(async () => {
      try {
        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, pat: patInput })
        });
        if (response.ok) {
          setToast({ message: "PAT updated successfully", type: 'success' });
          setPatInput('');
          fetchData();
        }
      } catch {
        setToast({ message: "Failed to update PAT", type: 'error' });
      }
    });
  }, [patInput, config, fetchData]);

  const handleUpdatePAT = () => {
    setModal({
      isOpen: true,
      title: "Update GitHub PAT",
      message: "Warning: Changing your Personal Access Token can break your CMS if the new token is invalid. Are you sure you want to proceed?",
      type: 'danger',
      confirmLabel: "Yes, I understand",
      onConfirm: () => {
        setModal({
          isOpen: true,
          title: "Enter New Token",
          message: "Please enter your new GitHub Personal Access Token.",
          showInput: true,
          confirmLabel: "Verify Token",
          onConfirm: () => confirmUpdatePAT()
        });
      }
    });
  };

  const handleReinitialize = () => {
    executeSudoAction(async () => {
      try {
        const res = await fetch('/api/setup', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          localStorage.clear();
          window.location.href = '/login';
        } else {
          setToast({ message: "Failed to reset system", type: 'error' });
        }
      } catch {
        setToast({ message: "Network error during reset", type: 'error' });
      }
    });
  };

  const initializeDrafts = async () => {
    setInitializingDrafts(true);
    const templateNames = ['workbench.md', 'publishing.md', 'media.md'];
    try {
      for (const fileName of templateNames) {
        const res = await fetch(`/templates/${fileName}`);
        if (!res.ok) throw new Error(`Could not find template: ${fileName}`);
        const text = await res.text();
        await fetch('/api/github_upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: config.repo,
            path: '_drafts/' + fileName,
            branch: config.branch || 'main',
            filename: fileName,
            content: btoa(text),
            message: `Initialize CMS Draft Template: ${fileName}`
          })
        });
      }
      setToast({ message: "Draft templates initialized!", type: 'success' });
    } catch {
      setToast({ message: "Failed to initialize drafts", type: 'error' });
    } finally {
      setInitializingDrafts(false);
    }
  };

  const initializeTrash = async () => {
    setInitializingTrash(true);
    try {
      await fetch('/api/github_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: config.repo,
          path: '_trash/.keep',
          branch: config.branch || 'main',
          filename: '.keep',
          content: btoa(''),
          message: 'Initialize CMS Trash Directory'
        })
      });
      setToast({ message: "Trash system initialized!", type: 'success' });
    } catch {
      setToast({ message: "Failed to initialize trash", type: 'error' });
    } finally {
      setInitializingTrash(false);
    }
  };

  return {
    user,
    activeTab,
    setActiveTab,
    config,
    setConfig,
    loading,
    githubInfo,
    toast,
    setToast,
    currentTheme,
    profileData,
    setProfileData,
    isUpdatingProfile,
    isSavingPreferences,
    modal,
    setModal,
    sudoOpen,
    setSudoOpen,
    sudoAction,
    patInput,
    setPatInput,
    schema,
    setSchema,
    initializingDrafts,
    initializingTrash,
    isAdmin,
    handleSaveConfig,
    handleSaveSchema,
    changeTheme,
    savePreferences,
    handleUpdateProfile,
    handleUpdatePAT,
    handleReinitialize,
    initializeDrafts,
    initializeTrash,
    executeSudoAction,
    triggerRebuild
  };
};
