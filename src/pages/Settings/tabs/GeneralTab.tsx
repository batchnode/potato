import React from 'react';
import { Sun, Moon, Laptop, Loader2, Key, Globe, ShieldAlert, FolderPlus, CheckCircle2, Activity } from 'lucide-react';
import ThemeOption from '../components/ThemeOption';
import ConfigInput from '../components/ConfigInput';
import type { Config, User } from '../../../types';
import type { ProfileData } from '../hooks/useSettingsLogic';

interface GeneralTabProps {
  user: User;
  isAdmin: boolean;
  currentTheme: string;
  changeTheme: (theme: string) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  handleUpdateProfile: () => void;
  isUpdatingProfile: boolean;
  config: Config;
  setConfig: (config: Config) => void;
  initializeTrash: () => void;
  initializingTrash: boolean;
  triggerRebuild: (reason: string) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  user,
  isAdmin,
  currentTheme,
  changeTheme,
  profileData,
  setProfileData,
  handleUpdateProfile,
  isUpdatingProfile,
  config,
  setConfig,
  initializeTrash,
  initializingTrash,
  triggerRebuild,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
    {/* Appearance */}
    <div className="bg-secondary-bg/30 p-6 rounded-3xl border border-border h-full flex flex-col space-y-6">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Sun size={24} /></div>
        <div><h3 className="font-bold text-xl text-foreground">Appearance</h3><p className="text-sm opacity-60 text-foreground">Personalize your workspace theme</p></div>
      </header>
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-4">
          <ThemeOption active={currentTheme === 'default'} icon={<Laptop size={18} />} label="Default" onClick={() => changeTheme('default')} />
          <ThemeOption active={currentTheme === 'black'} icon={<Moon size={18} />} label="Black" onClick={() => changeTheme('black')} />
          <ThemeOption active={currentTheme === 'light'} icon={<Sun size={18} />} label="Light" onClick={() => changeTheme('light')} />
        </div>
      </div>
    </div>

    {/* Profile */}
    <div className="bg-secondary-bg/30 p-6 rounded-3xl border border-border h-full flex flex-col space-y-6">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Key size={24} /></div>
        <div><h3 className="font-bold text-xl text-foreground">My Profile</h3><p className="text-sm opacity-60 text-foreground">Update your account credentials</p></div>
      </header>
      <div className="space-y-4">
        <ConfigInput label="Current Password" value={profileData.currentPassword} onChange={v => setProfileData({ ...profileData, currentPassword: v })} type="password" placeholder="Required for changes" />
        <ConfigInput label="New Email" value={profileData.newEmail} onChange={v => setProfileData({ ...profileData, newEmail: v })} placeholder={user.email} />
        <ConfigInput label="New Password" value={profileData.newPassword} onChange={v => setProfileData({ ...profileData, newPassword: v })} type="password" placeholder="••••••••" />
        <button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="w-full py-4 bg-foreground text-background rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition disabled:opacity-50 active:scale-95 mt-2">
          {isUpdatingProfile ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Update Credentials"}
        </button>
      </div>
    </div>

    {/* Site Identity (Admin Only) */}
    {isAdmin && (
      <div className="lg:col-span-2 bg-secondary-bg/30 p-6 rounded-3xl border border-border space-y-6">
        <header className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Globe size={24} /></div>
          <div><h3 className="font-bold text-xl text-foreground">Site Identity</h3><p className="text-sm opacity-60 text-foreground">Global instance settings</p></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ConfigInput label="Administrator Email" value={config.email || ''} onChange={(v) => setConfig({ ...config, email: v })} />
          </div>
          <ConfigInput label="Website URL" value={config.websiteUrl || ''} onChange={(v) => setConfig({ ...config, websiteUrl: v })} placeholder="https://my-blog.com" />
          <ConfigInput label="CMS Project / Blog URL" value={config.cmsBlogUrl || ''} onChange={(v) => setConfig({ ...config, cmsBlogUrl: v })} placeholder="https://github.com/user/cms-blog" />
        </div>
      </div>
    )}

    {isAdmin && (
      <div className="lg:col-span-2 space-y-6 pt-4 border-t border-border/50">
        <header className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><ShieldAlert size={24} /></div>
          <div><h3 className="font-bold text-xl text-foreground">Content Safety</h3><p className="text-sm opacity-60 text-foreground">Manage deletion workflows</p></div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-secondary-bg rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-card rounded-xl shadow-sm text-red-500 shrink-0"><FolderPlus size={20} /></div>
              <div><h4 className="font-bold text-foreground">Soft Delete Mode</h4><p className="text-xs opacity-60 text-foreground mt-1">Moves posts to `_trash`.</p></div>
            </div>
            <button onClick={initializeTrash} disabled={config.trashEnabled || initializingTrash} className={`px-6 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 w-full md:w-auto active:scale-95 ${config.trashEnabled ? 'bg-green-100/10 text-green-500' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20'}`}>
              {initializingTrash ? <Loader2 className="animate-spin" size={14} /> : (config.trashEnabled ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />)}
              {config.trashEnabled ? 'Active' : 'Enable Soft Delete'}
            </button>
          </div>
          <div className="p-6 bg-secondary-bg rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-card rounded-xl shadow-sm text-indigo-500 shrink-0"><Activity size={20} /></div>
              <div><h4 className="font-bold text-foreground">Manual Deployment</h4><p className="text-xs opacity-60 text-foreground mt-1">Force a full site rebuild.</p></div>
            </div>
            <button onClick={() => triggerRebuild('Manual Rebuild')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 w-full md:w-auto active:scale-95">
              <Activity size={14} /> Force Rebuild
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default GeneralTab;