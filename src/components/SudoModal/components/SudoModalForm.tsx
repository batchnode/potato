import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface SudoModalFormProps {
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

const SudoModalForm: React.FC<SudoModalFormProps> = ({
  password,
  setPassword,
  loading,
  error,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin Password"
        className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition text-center font-bold tracking-widest placeholder:opacity-40"
      />
      {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password}
        className={cn(
          "w-full py-3 bg-foreground text-background rounded-xl font-bold text-xs hover:opacity-90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2",
          loading && "cursor-not-allowed"
        )}
      >
        {loading && <Loader2 className="animate-spin" size={14} />}
        Verify
      </button>
    </form>
  );
};

export default SudoModalForm;
