import { useState, useEffect } from 'react';
import type { Config } from '../../types';

export function useConfig() {
    const [config, setConfig] = useState<Config>(() => {
        const saved = localStorage.getItem('potato_config');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        const handleStorage = () => {
            const saved = localStorage.getItem('potato_config');
            setConfig(saved ? JSON.parse(saved) : {});
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('potato_config_updated', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('potato_config_updated', handleStorage);
        };
    }, []);

    return config;
}
