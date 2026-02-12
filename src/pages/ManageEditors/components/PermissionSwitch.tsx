import React from 'react';
import { ToggleRight, ToggleLeft, CheckSquare, XCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const PermissionSwitch: React.FC<{ active: boolean; onClick: () => void; disabled?: boolean }> = ({ active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "transition-all duration-300 active:scale-90",
      disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer hover:opacity-80"
    )}
  >
    {active ? (
      <ToggleRight size={32} className="text-indigo-600 mx-auto" strokeWidth={1.5} />
    ) : (
      <ToggleLeft size={32} className="text-foreground/10 mx-auto" strokeWidth={1.5} />
    )}
  </button>
);

export const PermissionToggle: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95",
      active ? "bg-indigo-500/10 border-indigo-500/20" : "bg-foreground/5 border-transparent opacity-60"
    )}
  >
    {active ? <CheckSquare size={20} className="text-indigo-500" /> : <XCircle size={20} className="text-foreground/20" />}
    <span className={cn("text-[9px] font-black uppercase tracking-widest", active ? "text-indigo-600" : "text-foreground/40")}>{label}</span>
  </button>
);

export const CompactPermissionItem: React.FC<{ label: string; active: boolean; onClick: () => void; disabled?: boolean }> = ({ label, active, onClick, disabled }) => (
  <div className={cn(
    "flex flex-col items-center gap-1 p-2 flex-1 min-w-[80px] bg-foreground/[0.03] rounded-xl border border-border/50",
    disabled && "opacity-40"
  )}>
    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40 text-center">{label}</span>
    <PermissionSwitch active={active} onClick={onClick} disabled={disabled} />
  </div>
);
