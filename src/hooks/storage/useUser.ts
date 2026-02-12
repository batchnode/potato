import { useState, useEffect } from 'react';
import type { User } from '../../types';

export function useUser() {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('potato_session');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const handleStorage = () => {
            const saved = localStorage.getItem('potato_session');
            setUser(saved ? JSON.parse(saved) : null);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return user;
}
