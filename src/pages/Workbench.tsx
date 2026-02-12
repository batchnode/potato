import React, { useState, useEffect } from 'react';
import {
  CircleAlert, FileText, ShieldCheck,
  User as UserIcon, Inbox, X
} from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import PreviewModal from '../components/PreviewModal';
import LoadingScreen from '../components/LoadingScreen';
import { useWorkbenchLogic } from './Workbench/hooks/useWorkbenchLogic';
import WorkbenchHeader from './Workbench/components/WorkbenchHeader';
import InfrastructureInit from './Workbench/components/InfrastructureInit';
import TabButton from './Workbench/components/TabButton';
import SearchBar from './Workbench/components/SearchBar';
import WorkbenchTable from './Workbench/components/WorkbenchTable';
import WorkbenchBento from './Workbench/components/WorkbenchBento';
import ActivityFeed from './Workbench/components/ActivityFeed';
import { cn } from '../utils/cn';

const Workbench: React.FC = () => {
  const {
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
    canPublish,
    totalPages,
    paginatedItems,
    filteredItems,
    handleAction,
    copyGuides
  } = useWorkbenchLogic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync selection count with BottomNav
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('potato-selection-count', { detail: selectedItems.length }));
  }, [selectedItems.length]);

  // Listen for bottom nav actions
  useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'tab-drafts') setActiveTab('drafts');
      else if (e.detail === 'tab-review') setActiveTab('review');
      else if (e.detail === 'refresh-workbench') fetchWorkbench();
      else if (e.detail === 'toggle-explorer') setIsSidebarOpen(prev => !prev);
      else if (['preview-item', 'edit-item', 'submit-item', 'approve-item', 'delete-item'].includes(e.detail)) {
        if (selectedItems.length === 0) {
          setToast({ message: "Please select an item first", type: 'error' });
          return;
        }

        if (selectedItems.length > 1 && (e.detail === 'preview-item' || e.detail === 'edit-item')) {
          setToast({ message: "Please select only one item to preview or edit", type: 'error' });
          return;
        }

        const item = paginatedItems.find(i => i.sha === selectedItems[0]);
        if (!item) return;

        if (e.detail === 'preview-item') setPreview({ isOpen: true, filename: item.name, sourceDir: sourceDir });
        else if (e.detail === 'edit-item') navigate(`/edit/${item.name}?draft=true&source=${sourceDir}`);
        else if (e.detail === 'submit-item') handleAction(item, 'submit');
        else if (e.detail === 'approve-item') handleAction(item, 'approve');
        else if (e.detail === 'delete-item') handleAction(item, 'delete');
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [setActiveTab, fetchWorkbench, selectedItems, paginatedItems, sourceDir, navigate, handleAction, setPreview, setToast]);

  if (loading && !initializing) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal {...modal} onClose={() => setModal((prev: any) => ({ ...prev, isOpen: false }))} />
      <PreviewModal
        {...preview}
        onClose={() => setPreview({ ...preview, isOpen: false })}
        repo={config.repo!}
        pat={config.pat!}
        branch={config.branch!}
      />

      <WorkbenchHeader 
        onRefresh={fetchWorkbench}
        onNewDraft={() => navigate('/create-post')}
        onReinit={copyGuides}
        selectedCount={selectedItems.length}
        activeTab={activeTab}
        canPublish={canPublish}
        onPreview={() => {
          const item = paginatedItems.find(i => i.sha === selectedItems[0]);
          if (item) setPreview({ isOpen: true, filename: item.name, sourceDir: sourceDir });
        }}
        onEdit={() => {
          const item = paginatedItems.find(i => i.sha === selectedItems[0]);
          if (item) navigate(`/edit/${item.name}?draft=true&source=${sourceDir}`);
        }}
        onAction={(action) => {
          if (selectedItems.length === 0) return;
          const item = paginatedItems.find(i => i.sha === selectedItems[0]);
          if (item) handleAction(item, action);
        }}
      />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
          <div className="max-w-6xl mx-auto space-y-8 pb-24">
            {fetchError && (
              <div className="mx-2 p-6 bg-amber-500/10 text-amber-500 rounded-3xl border border-amber-500/20 flex items-center gap-3">
                <CircleAlert size={20} />
                <p className="text-sm font-medium">{fetchError}</p>
              </div>
            )}

            {!foldersInitialized && !loading && (
              <InfrastructureInit 
                onInitialize={copyGuides}
                initializing={initializing}
              />
            )}

            {foldersInitialized && (
              <>
                <WorkbenchBento 
                  draftCount={drafts.length}
                  reviewCount={reviewItems.length}
                  foldersInitialized={foldersInitialized}
                />

                <div className="flex gap-2 border-b border-border px-2 pt-4">
                  <TabButton
                    active={activeTab === 'drafts'}
                    onClick={() => setActiveTab('drafts')}
                    icon={<UserIcon size={16} />}
                    label="My Drafts"
                    count={drafts.length}
                  />
                  <TabButton
                    active={activeTab === 'review'}
                    onClick={() => setActiveTab('review')}
                    icon={<ShieldCheck size={16} />}
                    label="Pending Review"
                    count={reviewItems.length}
                  />
                </div>

                <div className="px-2">
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>

                <WorkbenchTable 
                  paginatedItems={paginatedItems}
                  selectedItems={selectedItems}
                  activeTab={activeTab}
                  searchTerm={searchTerm}
                  processing={processing}
                  canPublish={canPublish}
                  sourceDir={sourceDir}
                  onToggleSelect={toggleSelect}
                  onPreview={(item) => setPreview({ isOpen: true, filename: item.name, sourceDir: sourceDir })}
                  onEdit={(item) => navigate(`/edit/${item.name}?draft=true&source=${sourceDir}`)}
                  onAction={(item, action) => handleAction(item, action)}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalFiltered={filteredItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>

        {/* Standardized Sidebar for Workbench Info & Activity */}
        <div className={cn(
          "lg:w-1/3 lg:border-l lg:border-border bg-card overflow-y-auto transition-all duration-300",
          isSidebarOpen ? "fixed inset-0 z-50 p-6" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-card/90 backdrop-blur-sm py-4 px-6 z-10 border-b border-border lg:border-none">
            <div className="flex items-center gap-2 text-foreground/40">
              <Inbox size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {selectedItems.length > 0 ? 'Selection Info' : 'Workbench Activity'}
              </span>
            </div>
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 bg-foreground/5 rounded-xl text-foreground/60"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="px-6 pb-24">
            {selectedItems.length > 0 ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem]">
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">{selectedItems.length} Items Selected</h3>
                  <p className="text-xs text-indigo-600/60 font-medium leading-relaxed">
                    <span className="xl:hidden">Use the bottom navigation to manage selected content.</span>
                    <span className="hidden xl:inline">Use the action bar at the top or bottom navigation to manage selected content.</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 px-2">Current Selection</p>
                  {paginatedItems.filter(p => selectedItems.includes(p.sha)).map(item => (
                    <div key={item.sha} className="p-4 bg-foreground/5 rounded-2xl flex items-center gap-3">
                      <FileText size={14} className="text-foreground/40" />
                      <span className="text-xs font-bold truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <ActivityFeed />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Workbench;
