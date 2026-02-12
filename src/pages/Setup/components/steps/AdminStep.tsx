import React from 'react';
import { Lock, Mail, Key } from 'lucide-react';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface AdminStepProps {
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
  inputClasses: string;
}

const AdminStep: React.FC<AdminStepProps> = ({ formData, setFormData, inputClasses }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          <Lock size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Initialize Admin Account</h1>
        <p className="text-slate-500 mt-2">Create your credentials for dashboard access.</p>
      </header>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Admin Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@potato.io" className={inputClasses} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Master Password</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••••••" className={inputClasses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStep;
