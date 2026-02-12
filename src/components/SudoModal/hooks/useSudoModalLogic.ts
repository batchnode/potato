import { useState, useCallback } from 'react';
import { useConfig } from '../../../hooks/useStorage';

interface UseSudoModalLogicProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const useSudoModalLogic = ({ onClose, onSuccess }: UseSudoModalLogicProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = useConfig();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: config.email, password })
      });

      if (response.ok) {
        setPassword('');
        onClose();
        onSuccess();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Invalid password or server error");
    } finally {
      setLoading(false);
    }
  }, [config.email, password, onClose, onSuccess]);

  return {
    password,
    setPassword,
    loading,
    error,
    handleSubmit
  };
};
