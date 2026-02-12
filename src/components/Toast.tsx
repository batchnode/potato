import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 xl:bottom-8 xl:right-8 xl:left-auto xl:translate-x-0 z-[150] animate-in slide-in-from-bottom-10 duration-300 w-[90vw] max-w-sm xl:w-auto">
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border bg-card backdrop-blur-xl",
        isSuccess ? "border-green-500/20" : "border-red-500/20"
      )}>
        <div className={cn(
          "p-2 rounded-xl",
          isSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
        <div className="pr-8">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none mb-1">
            {isSuccess ? 'Success' : 'Error'}
          </p>
          <p className="text-sm font-bold text-foreground">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-foreground/5 rounded-lg text-foreground/40 transition"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
