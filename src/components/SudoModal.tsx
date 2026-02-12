import React from 'react';
import { Lock, X } from 'lucide-react';
import { useSudoModalLogic } from './SudoModal/hooks/useSudoModalLogic';
import SudoModalForm from './SudoModal/components/SudoModalForm';

interface SudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
}

const SudoModal: React.FC<SudoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Security Check",
  message = "Please enter your admin password to continue."
}) => {
  const {
    password,
    setPassword,
    loading,
    error,
    handleSubmit
  } = useSudoModalLogic({ onClose, onSuccess });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <div className="bg-card w-full max-w-sm rounded-[2rem] shadow-2xl border border-border relative z-10 p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <div className="p-2.5 bg-secondary-bg rounded-xl text-foreground/40">
            <Lock size={18} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary-bg rounded-lg text-foreground/20 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-foreground/40 mb-6">{message}</p>

        <SudoModalForm 
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default SudoModal;
