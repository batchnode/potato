import React from 'react';
import Toast from '../components/Toast';
import { useLoginLogic } from './Login/hooks/useLoginLogic';
import LoginForm from './Login/components/LoginForm';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    toast,
    setToast,
    handleLogin
  } = useLoginLogic({ onLogin });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-md w-full space-y-10">
        <div className="flex flex-col items-center gap-4">
          <img src="/potato.png" alt="Potato" className="w-16 h-16" />
          <h1 className="text-3xl font-black text-slate-900">Sign in to Potato</h1>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50">
          <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            onSubmit={handleLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;