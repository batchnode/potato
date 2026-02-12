import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../../types';

interface UseLoginLogicProps {
  onLogin: (user: User) => void;
}

export const useLoginLogic = ({ onLogin }: UseLoginLogicProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('potato_session', JSON.stringify(data.user));

        if (!data.user.isSetupMode) {
          const configRes = await fetch('/api/get_config');
          if (configRes.ok) {
            const configData = await configRes.json();
            localStorage.setItem('potato_config', JSON.stringify(configData));
          }
        }

        onLogin(data.user);
        navigate(data.user.isSetupMode ? '/setup' : '/');
      } else {
        setToast({ message: data.error || "Invalid credentials", type: 'error' });
      }
    } catch {
      setToast({ message: "Network error. Please check your connection.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    toast,
    setToast,
    handleLogin
  };
};
