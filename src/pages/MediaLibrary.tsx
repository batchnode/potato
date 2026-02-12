import React, { useState, useEffect } from 'react';
import { CircleAlert, X, FolderTree, Image as ImageIcon } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import { useMediaLibraryLogic } from './MediaLibrary/hooks/useMediaLibraryLogic';
import MediaHeader from './MediaLibrary/components/MediaHeader';
import MediaGrid from './MediaLibrary/components/MediaGrid';
import { DirectoryTree } from './MediaLibrary/components/DirectoryTree';
import { cn } from '../utils/cn';

const MediaLibrary: React.FC = () => {
  const {
    user,
    assets,
    loading,
    error,
    uploading,
    toast,
    setToast,
    activeMenu,
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
    openRenameModal,
    openDeleteModal,
    currentPath,
    setCurrentPath,
    selectedAsset,
    handleSelect,
    navigateIn,
    breadcrumbs,
    createFolder,
    openCreateFolderModal,
    installWebPAction,
    triggerWebPConversion,
    lastWorkflow
  } = useMediaLibraryLogic();

  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  // Sync selection count with BottomNav
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('potato-selection-count', { detail: selectedAsset ? 1 : 0 }));
  }, [selectedAsset]);

  // Listen for bottom nav actions
  useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'toggle-explorer') {
        setIsExplorerOpen(prev => !prev);
      } else if (e.detail === 'new-folder') {
        openCreateFolderModal();
        setModal((prev: any) => ({
          ...prev,
          onConfirm: () => createFolder(modalInput)
        }));
      } else if (e.detail === 'upload-asset') {
        fileInputRef.current?.click();
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [openCreateFolderModal, createFolder, modalInput, setModal, fileInputRef]);

  if (!user) return null;
  if (loading && assets.length === 0) return <LoadingScreen />;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal
        {...modal}
        inputValue={modalInput}
        onInputChange={setModalInput}
        onClose={() => setModal((prev: any) => ({ ...prev, isOpen: false }))}
      />

      <MediaHeader 
        onUploadClick={() => fileInputRef.current?.click()}
        onNewFolderClick={() => {
          openCreateFolderModal();
          setModal((prev: any) => ({
            ...prev,
            onConfirm: () => createFolder(modalInput)
          }));
        }}
        uploading={uploading}
      />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
          <div className="max-w-6xl mx-auto space-y-10 pb-24">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />

            {error && (
              <div className="mx-2 p-6 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 flex items-center gap-3">
                <CircleAlert size={20} />
                <h4 className="font-bold">Fetch Failed</h4>
              </div>
            )}

            <MediaGrid 
              assets={assets}
              loading={loading}
              error={error}
              activeMenu={activeMenu}
              selectedAsset={selectedAsset}
              menuSide={menuSide}
              onToggleMenu={toggleMenu}
              onSelect={handleSelect}
              onDownload={handleDownload}
              onRename={(asset) => {
                openRenameModal(asset);
                setModal((prev: any) => ({
                  ...prev,
                  onConfirm: () => executeRename(asset, modalInput)
                }));
              }}
              onDelete={openDeleteModal}
              onNavigate={navigateIn}
              breadcrumbs={breadcrumbs}
              onUploadFirst={() => fileInputRef.current?.click()}
              menuRef={menuRef}
            />
          </div>
        </div>

        {/* Standardized Sidebar for Media Explorer */}
        <div className={cn(
          "lg:w-1/3 lg:border-l lg:border-border bg-card overflow-y-auto transition-all duration-300 flex flex-col",
          isExplorerOpen ? "fixed inset-0 z-50 p-6" : "hidden lg:flex"
        )}>
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-card/90 backdrop-blur-sm py-4 px-6 z-10 border-b border-border lg:border-none">
            <div className="flex items-center gap-2 text-foreground/40">
              <FolderTree size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Repository Explorer</span>
            </div>
            {isExplorerOpen && (
              <button 
                onClick={() => setIsExplorerOpen(false)} 
                className="p-2 bg-foreground/5 rounded-xl text-foreground/60"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="px-6 pb-24 flex-1 flex flex-col">
             <div className="flex-[0.6] overflow-y-auto no-scrollbar">
                <DirectoryTree 
                  currentPath={currentPath} 
                  onSelect={(path) => {
                    setCurrentPath(path);
                    setIsExplorerOpen(false);
                  }} 
                />
             </div>
             
             {/* 60/40 Split - Bottom section for advanced actions */}
             <div className="flex-[0.4] border-t border-border mt-6 pt-6 overflow-y-auto no-scrollbar space-y-6">
                {selectedAsset ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Asset Metadata</p>
                      <button onClick={() => handleSelect(selectedAsset)} className="text-[10px] font-bold text-foreground/20 hover:text-foreground">Clear</button>
                    </div>
                    <div className="p-4 bg-foreground/5 rounded-2xl space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Filename</p>
                        <p className="text-xs font-bold truncate">{selectedAsset.name}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Size</p>
                          <p className="text-xs font-bold">{(selectedAsset.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Type</p>
                          <p className="text-xs font-bold uppercase">{selectedAsset.name.split('.').pop()}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(selectedAsset)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                    >
                      Download Asset
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Optimize Assets</p>
                        {lastWorkflow && (
                          <div className="flex items-center gap-1.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              lastWorkflow.status === 'completed' ? (lastWorkflow.conclusion === 'success' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-amber-500 animate-pulse'
                            )} />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{lastWorkflow.status}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl space-y-4">
                        <p className="text-[11px] font-medium text-foreground/60 leading-relaxed">
                          Automate your workflow by converting all repository images to WebP and updating all content references automatically.
                        </p>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={installWebPAction}
                            className="w-full py-3 bg-card border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors active:scale-95"
                          >
                            Install Optimizer Action
                          </button>
                          <button 
                            onClick={triggerWebPConversion}
                            disabled={lastWorkflow?.status === 'in_progress'}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-90 transition-all disabled:opacity-50"
                          >
                            {lastWorkflow?.status === 'in_progress' ? 'Conversion Running...' : 'Convert all to WebP'}
                          </button>
                        </div>
                        {lastWorkflow?.status === 'completed' && (
                          <div className="pt-2 border-t border-indigo-500/10">
                            <p className="text-[9px] font-bold text-indigo-600/60 flex items-center justify-between">
                              <span>Last Run: {new Date(lastWorkflow.updated_at).toLocaleTimeString()}</span>
                              <a href={lastWorkflow.html_url} target="_blank" rel="noreferrer" className="underline hover:text-indigo-600">View Log</a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-20 flex flex-col items-center justify-center text-center opacity-10">
                      <ImageIcon size={20} className="mb-1" />
                      <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed">Select a file to<br />view properties</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MediaLibrary;