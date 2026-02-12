import React from 'react';
import { CircleAlert } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';
import { useManageEditorsLogic } from './ManageEditors/hooks/useManageEditorsLogic';
import EditorHeader from './ManageEditors/components/EditorHeader';
import EditorTable from './ManageEditors/components/EditorTable';
import EditorCard from './ManageEditors/components/EditorCard';
import AddEditorModal from './ManageEditors/components/AddEditorModal';

const ManageEditors: React.FC = () => {
  const {
    user,
    editors,
    loading,
    error,
    toast,
    setToast,
    modal,
    setModal,
    showAddModal,
    setShowAddModal,
    newEditor,
    setNewEditor,
    togglePermission,
    handleDelete,
    handleAddEditor
  } = useManageEditorsLogic();

  // Listen for bottom nav actions
  React.useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'add-editor') setShowAddModal(true);
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [setShowAddModal]);

  // Sync selection count with BottomNav (Editors don't have bulk select yet, but we sync for UI consistency)
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('potato-selection-count', { detail: 0 }));
  }, []);

  if (!user) return null;
  if (loading && editors.length === 0) return <LoadingScreen />;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal {...modal} onClose={() => setModal((prev: any) => ({ ...prev, isOpen: false }))} />

      <EditorHeader onAddClick={() => setShowAddModal(true)} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          {error && (
            <div className="mx-2 p-6 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 flex items-center gap-3">
              <CircleAlert size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <EditorTable 
              editors={editors}
              onTogglePermission={togglePermission}
              onDelete={handleDelete}
            />
            <EditorCard 
              editors={editors}
              onTogglePermission={togglePermission}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      <AddEditorModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newEditor={newEditor}
        setNewEditor={setNewEditor}
        onAdd={handleAddEditor}
      />
    </main>
  );
};

export default ManageEditors;