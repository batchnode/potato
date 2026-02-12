import React from 'react';
import { CircleAlert } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import { useTrashLogic } from './Trash/hooks/useTrashLogic';
import TrashHeader from './Trash/components/TrashHeader';
import TrashToolbar from './Trash/components/TrashToolbar';
import TrashTable from './Trash/components/TrashTable';
import type { GitHubContent } from '../types';

const TrashPage: React.FC = () => {
  const {
    user,
    trashItems,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    selectedItems,
    toast,
    setToast,
    modal,
    setModal,
    processing,
    paginatedPosts,
    totalPages,
    handleRestore,
    executeDelete,
    handleEmptyTrash,
    canDelete,
    canRestore,
    toggleSelect,
    toggleSelectAll
  } = useTrashLogic();

  // Sync selection count with BottomNav
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('potato-selection-count', { detail: selectedItems.length }));
  }, [selectedItems.length]);

  // Listen for bottom nav actions
  React.useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'restore-all') {
        if (selectedItems.length === 0) {
          setToast({ message: "Select items to restore", type: 'error' });
          return;
        }
        // Bulk restore
        const itemsToRestore = trashItems.filter(p => selectedItems.includes(p.sha));
        itemsToRestore.forEach(item => handleRestore(item));
      } else if (e.detail === 'delete-all') {
        if (selectedItems.length === 0) {
          setToast({ message: "Select items to delete", type: 'error' });
          return;
        }
        // Selection-based delete
        const itemsToDelete = trashItems.filter(p => selectedItems.includes(p.sha));
        itemsToDelete.forEach(item => executeDelete(item));
      } else if (e.detail === 'select-all') {
        toggleSelectAll();
      } else if (e.detail === 'empty-trash') {
        handleEmptyTrash();
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [selectedItems, trashItems, handleRestore, executeDelete, toggleSelectAll, handleEmptyTrash, setToast]);

  if (!user) return null;
  if (loading && !processing && trashItems.length === 0) return <LoadingScreen />;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal {...modal} onClose={() => setModal((prev: any) => ({ ...prev, isOpen: false }))} />

      <TrashHeader 
        onEmptyTrash={handleEmptyTrash}
        canDelete={canDelete}
        hasItems={trashItems.length > 0}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          <TrashToolbar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {error && (
            <div className="mx-2 p-6 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 flex items-center gap-3">
              <CircleAlert size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <TrashTable 
            paginatedPosts={paginatedPosts}
            selectedItems={selectedItems}
            processing={processing}
            canRestore={canRestore}
            canDelete={canDelete}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onRestore={handleRestore}
            onDeleteRequest={(post: GitHubContent) => setModal({
              isOpen: true,
              title: "Delete Permanently",
              message: `Are you sure you want to permanently delete "${post.name}"? This action cannot be undone.`,
              type: "danger",
              confirmLabel: "Delete Permanent",
              onConfirm: () => executeDelete(post)
            })}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
};

export default TrashPage;
