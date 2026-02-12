import { useState, useCallback } from 'react';
import { useUser, useEditorsData } from '../../../hooks/useStorage';
import type { Editor } from '../../../types';

export interface NewEditor {
  email: string;
  password: string;
  role: 'Administrator' | 'Editor';
  requireReview: boolean;
  canDelete: boolean;
  canEditPublished: boolean;
}

export const useManageEditorsLogic = () => {
  const user = useUser();
  const { editors, loading, error, refresh: fetchEditors, saveEditors, deleteEditor } = useEditorsData();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'danger' | 'success';
    confirmLabel?: string;
    onConfirm: () => void;
  }>({ 
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEditor, setNewEditor] = useState<NewEditor>({
    email: '',
    password: '',
    role: 'Editor',
    requireReview: true,
    canDelete: false,
    canEditPublished: false
  });

  const togglePermission = useCallback(async (id: string, field: keyof Editor) => {
    const updated = editors.map(e => {
      if (e.id === id && e.role !== 'Administrator') {
        return { ...e, [field]: !e[field] };
      }
      return e;
    });
    const success = await saveEditors(updated);
    if (!success) {
      setToast({ message: "Failed to update permissions", type: 'error' });
    }
  }, [editors, saveEditors]);

  const handleDelete = useCallback((editor: Editor) => {
    if (editor.role === 'Administrator') {
      setToast({ message: "Administrator cannot be removed", type: 'error' });
      return;
    }
    setModal({
      isOpen: true,
      title: 'Remove Access',
      message: `Are you sure you want to remove ${editor.email}? They will lose all access immediately.`,
      type: 'danger',
      confirmLabel: 'Remove Member',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        const success = await deleteEditor(editor.id);
        if (success) {
          setToast({ message: "User removed successfully", type: 'success' });
        } else {
          setToast({ message: "Failed to remove user", type: 'error' });
        }
      }
    });
  }, [deleteEditor]);

  const handleAddEditor = async () => {
    if (!newEditor.email || !newEditor.password) {
      setToast({ message: "Please fill in all fields", type: 'error' });
      return;
    }

    const editorToAdd: Editor = {
      ...newEditor,
      id: Date.now().toString(),
      joined: new Date().toLocaleDateString()
    };

    const success = await saveEditors([...editors, editorToAdd]);
    if (success) {
      setShowAddModal(false);
      setToast({ message: "Editor account created!", type: 'success' });
      setNewEditor({
        email: '',
        password: '',
        role: 'Editor',
        requireReview: true,
        canDelete: false,
        canEditPublished: false
      });
      fetchEditors();
    } else {
      setToast({ message: "Failed to create editor", type: 'error' });
    }
  };

  return {
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
  };
};
