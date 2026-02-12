import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info' | 'success';
  confirmLabel?: string;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (val: string) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  showInput = false,
  inputValue = '',
  onInputChange
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="bg-card w-full max-w-sm rounded-[2rem] shadow-2xl border border-border overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              isDanger ? "bg-red-500/10 text-red-500" :
                isSuccess ? "bg-green-500/10 text-green-500" :
                  "bg-indigo-500/10 text-indigo-500"
            )}>
              {isDanger ? <AlertTriangle size={20} /> :
                isSuccess ? <CheckCircle2 size={20} /> :
                  <Info size={20} />}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-foreground/5 rounded-lg text-foreground/40 transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-foreground/40 leading-relaxed mb-6">{message}</p>

          {showInput && (
            <div className="mb-6">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-foreground transition-all"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-foreground/5 text-foreground/60 rounded-xl font-bold text-xs hover:bg-foreground/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-xs text-white transition shadow-lg",
                isDanger ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" :
                  "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;