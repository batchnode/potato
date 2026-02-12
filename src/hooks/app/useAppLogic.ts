import { useState, useEffect, useCallback } from 'react';
import type { User } from '../../types';

export const useAppLogic = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [welcomeToast, setWelcomeToast] = useState(false);

  const [viewMode, setViewMode] = useState<'Administrator' | 'Editor' | null>(null);

  useEffect(() => {
    if (user) {
        setViewMode(user.role);
    }
  }, [user]);

  useEffect(() => {
    const handleToggle = () => {
        setViewMode(prev => prev === 'Administrator' ? 'Editor' : 'Administrator');
    };
    window.addEventListener('potato-toggle-view-mode', handleToggle);
    return () => window.removeEventListener('potato-toggle-view-mode', handleToggle);
  }, []);

  const applyTheme = useCallback((theme: string) => {
    document.body.classList.remove('theme-black', 'theme-light');
    if (theme === 'black') document.body.classList.add('theme-black');
    if (theme === 'light') document.body.classList.add('theme-light');
    localStorage.setItem('potato_theme', theme);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const status = await res.json();
        setIsConfigured(status.configured);

        const savedTheme = localStorage.getItem('potato_theme');
        if (savedTheme) applyTheme(savedTheme);

        const session = localStorage.getItem('potato_session');
        if (session) {
          const parsedUser = JSON.parse(session);
          if (!parsedUser.isSetupMode) {
            const [configRes, prefsRes] = await Promise.all([
              fetch('/api/get_config'),
              fetch(`/api/profile?email=${parsedUser.email}`)
            ]);

            if (configRes.ok) {
              const configData = await configRes.json();
              localStorage.setItem('potato_config', JSON.stringify(configData));
            }

            if (prefsRes.ok) {
              const prefs = await prefsRes.json();
              applyTheme(prefs.theme);
            }
          }
          setUser(parsedUser);
        }
      } catch {
        setIsConfigured(false);
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [applyTheme]);

  const handleSetupComplete = useCallback(() => {
    setIsConfigured(true);
    localStorage.removeItem('potato_session');
    setUser(null);
    localStorage.setItem('potato_welcome', 'true');
  }, []);

  const handleLogin = useCallback((loggedUser: User) => {
    setUser(loggedUser);
    if (localStorage.getItem('potato_welcome')) {
      setWelcomeToast(true);
      localStorage.removeItem('potato_welcome');
    }
  }, []);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isConfigured,
    user,
    checking,
    welcomeToast,
    setWelcomeToast,
    handleSetupComplete,
    handleLogin,
    closeSidebar,
    openSidebar,
    viewMode
  };
};
