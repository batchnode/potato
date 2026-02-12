import React from 'react';
import { Mail, Key, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@potato.io"
            className={cn(
              "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm",
              "focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Password</label>
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className={cn(
              "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm",
              "focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            )}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2",
          "hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-500/25"
        )}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <>{'Sign In'} <ArrowRight size={20} /></>}
      </button>
    </form>
  );
};

export default LoginForm;
