import React, { useState, useEffect, useCallback } from 'react';
import { CircleAlert, X, Layers, FileText } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import PreviewModal from '../components/PreviewModal';
import LoadingScreen from '../components/LoadingScreen';
import { useContentLogic } from './Content/hooks/useContentLogic';
import ContentHeader from './Content/components/ContentHeader';
import ContentToolbar from './Content/components/ContentToolbar';
import ContentTable from './Content/components/ContentTable';
import { cn } from '../utils/cn';

const Content: React.FC = () => {
  const {
    user,
    config,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedPosts,
    toast,
    setToast,
    modal,
    setModal,
    bulkProcessing,
    preview,
    setPreview,
    navigate,
    totalPages,
    paginatedPosts,
    canEditPublished,
    toggleSelect,
    toggleSelectAll,
    handleBulkAction
  } = useContentLogic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const triggerAction = useCallback((action: 'preview' | 'edit' | 'delete') => {
    if (selectedPosts.length === 0) {
      setToast({ message: `Please select a post to ${action}`, type: 'error' });
      return;
    }
    
    if (selectedPosts.length > 1 && (action === 'preview' || action === 'edit')) {
      setToast({ message: `Please select only one post to ${action}`, type: 'error' });
      return;
    }

    const firstPost = paginatedPosts.find(p => p.sha === selectedPosts[0]);
    if (!firstPost) return;

    if (action === 'preview') {
      setPreview({
        isOpen: true,
        filename: firstPost.name,
        sourceDir: (config.postsDir || '_posts').replace(/^\/+|\/+$/g, '')
      });
    } else if (action === 'edit') {
      navigate(`/edit/${firstPost.name}`);
    } else if (action === 'delete') {
      handleBulkAction('trash');
    }
  }, [selectedPosts, paginatedPosts, config.postsDir, navigate, handleBulkAction, setToast, setPreview]);

  // Sync selection count with BottomNav
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('potato-selection-count', { detail: selectedPosts.length }));
  }, [selectedPosts.length]);

  // Listen for bottom nav actions
  useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'toggle-explorer') {
        setIsSidebarOpen(prev => !prev);
      } else if (e.detail === 'preview-post') {
        triggerAction('preview');
      } else if (e.detail === 'edit-post') {
        triggerAction('edit');
      } else if (e.detail === 'delete-post') {
        triggerAction('delete');
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [triggerAction]);

  if (!user) return null;
  if (loading && !bulkProcessing) return <LoadingScreen />;

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

      <ContentHeader 
        onNewPost={() => navigate('/create-post')} 
        selectedCount={selectedPosts.length}
        onPreview={() => triggerAction('preview')}
        onEdit={() => triggerAction('edit')}
        onDelete={() => triggerAction('delete')}
      />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
          <div className="max-w-6xl mx-auto space-y-8 pb-24">
            <ContentToolbar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {error && (
              <div className="mx-2 p-6 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 flex items-center gap-3">
                <CircleAlert size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <ContentTable 
              paginatedPosts={paginatedPosts}
              selectedPosts={selectedPosts}
              bulkProcessing={bulkProcessing}
              canEditPublished={canEditPublished}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelect={toggleSelect}
              onPreview={(post) => setPreview({
                isOpen: true,
                filename: post.name,
                sourceDir: (config.postsDir || '_posts').replace(/^\/+|\/+$/g, '')
              })}
              onEdit={(post) => navigate(`/edit/${post.name}`)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Standardized Sidebar for Selection Info */}
        <div className={cn(
          "lg:w-1/3 lg:border-l lg:border-border bg-card overflow-y-auto transition-all duration-300",
          isSidebarOpen ? "fixed inset-0 z-50 p-6" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-card/90 backdrop-blur-sm py-4 px-6 z-10 border-b border-border lg:border-none">
            <div className="flex items-center gap-2 text-foreground/40">
              <Layers size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Selection Info</span>
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
            {selectedPosts.length > 0 ? (
              <div className="space-y-6">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem]">
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">{selectedPosts.length} Items Selected</h3>
                  <p className="text-xs text-indigo-600/60 font-medium leading-relaxed">
                    <span className="xl:hidden">Use the bottom navigation to manage selected content.</span>
                    <span className="hidden xl:inline">Use the action bar at the top or bottom navigation to manage selected content.</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 px-2">Selected Filenames</p>
                  {paginatedPosts.filter(p => selectedPosts.includes(p.sha)).map(post => (
                    <div key={post.sha} className="p-4 bg-foreground/5 rounded-2xl flex items-center gap-3">
                      <FileText size={14} className="text-foreground/40" />
                      <span className="text-xs font-bold truncate">{post.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-foreground/[0.02] border-2 border-dashed border-border/50 rounded-[3rem]">
                <div className="w-16 h-16 bg-foreground/5 text-foreground/20 rounded-[2rem] flex items-center justify-center mb-4">
                  <Layers size={24} />
                </div>
                <p className="text-xs font-bold text-foreground/40 leading-relaxed max-w-[180px]">Select a post from the list to view details and available actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Content;
