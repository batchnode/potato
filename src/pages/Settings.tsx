import React from 'react';
import {
  Globe,
  Code,
  Save,
  Braces,
  Shield
} from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import SudoModal from '../components/SudoModal';
import LoadingScreen from '../components/LoadingScreen';
import { useSettingsLogic } from './Settings/hooks/useSettingsLogic';
import SettingsNavItem from './Settings/components/SettingsNavItem';
import GeneralTab from './Settings/tabs/GeneralTab';
import GitHubTab from './Settings/tabs/GitHubTab';
import SchemaTab from './Settings/tabs/SchemaTab';
import SecurityTab from './Settings/tabs/SecurityTab';

const Settings: React.FC = () => {
  const {
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
    handleUpdateProfile,
    isUpdatingProfile,
    modal,
    setModal,
    sudoOpen,
    setSudoOpen,
    sudoAction,
    patInput,
    setPatInput,
    schema,
    setSchema,
    initializingTrash,
    isAdmin,
    handleSaveConfig,
    handleSaveSchema,
    changeTheme,
    savePreferences,
    handleUpdatePAT,
    handleReinitialize,
    initializeTrash,
    triggerRebuild
  } = useSettingsLogic();

  // Listen for bottom nav actions
  React.useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'tab-general') setActiveTab('general');
      else if (e.detail === 'tab-github') setActiveTab('github');
      else if (e.detail === 'tab-schema') setActiveTab('schema');
      else if (e.detail === 'tab-security') setActiveTab('security');
      else if (e.detail === 'save-settings') {
        if (activeTab === 'schema') handleSaveSchema();
        else if (activeTab === 'general') {
          handleSaveConfig().then(() => savePreferences());
        }
        else handleSaveConfig();
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [setActiveTab, activeTab, handleSaveSchema, handleSaveConfig, savePreferences]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  const handleModalConfirm = () => {
    if (modal.showInput) {
      // confirmUpdatePAT is internal to useSettingsLogic, handled by onConfirm in useSettingsLogic
      modal.onConfirm();
    } else {
      modal.onConfirm();
    }
  };

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal 
        {...modal} 
        onConfirm={handleModalConfirm}
        inputValue={patInput} 
        onInputChange={setPatInput} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} 
      />
      <SudoModal isOpen={sudoOpen} onClose={() => setSudoOpen(false)} onSuccess={() => { setSudoOpen(false); sudoAction(); }} />

      {/* Persistent Header */}
      <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">System Settings</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Manage your Potato instance configuration</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Sidebar - Navigation & Actions */}
        <div className="hidden lg:flex lg:w-80 lg:border-r lg:border-border bg-card overflow-y-auto flex-col h-full shrink-0 z-20">
          <div className="p-4 space-y-2 flex-1">
            <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 mt-2">Configuration Groups</p>
            <SettingsNavItem icon={<Globe size={18} />} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            {isAdmin && (
              <>
                <SettingsNavItem icon={<Code size={18} />} label="Git & GitHub" active={activeTab === 'github'} onClick={() => setActiveTab('github')} />
                <SettingsNavItem icon={<Braces size={18} />} label="Content Schema" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
                <SettingsNavItem icon={<Shield size={18} />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
              </>
            )}
          </div>

          {/* Sticky Save Action Area */}
          {activeTab !== 'security' && (
            <div className="p-4 border-t border-border bg-card sticky bottom-0">
              <button 
                onClick={async () => {
                  if (activeTab === 'schema') handleSaveSchema();
                  else if (activeTab === 'general') {
                    await handleSaveConfig();
                    await savePreferences();
                  }
                  else handleSaveConfig();
                }} 
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
          <div className="max-w-5xl mx-auto pb-24">
            {activeTab === 'general' && (
              <GeneralTab 
                user={user}
                isAdmin={isAdmin}
                currentTheme={currentTheme}
                changeTheme={changeTheme}
                profileData={profileData}
                setProfileData={setProfileData}
                handleUpdateProfile={handleUpdateProfile}
                isUpdatingProfile={isUpdatingProfile}
                config={config}
                setConfig={setConfig}
                initializeTrash={initializeTrash}
                initializingTrash={initializingTrash}
                triggerRebuild={triggerRebuild}
              />
            )}

            {activeTab === 'github' && (
              <GitHubTab 
                config={config}
                setConfig={setConfig}
              />
            )}

            {activeTab === 'schema' && (
              <SchemaTab 
                schema={schema}
                setSchema={setSchema}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab 
                config={config}
                githubInfo={githubInfo}
                handleUpdatePAT={handleUpdatePAT}
                handleReinitialize={handleReinitialize}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;