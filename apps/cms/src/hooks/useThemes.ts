import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@kidspark/shared';
import { api } from '../lib/api';

export function useThemes() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setThemes(await api.themes.list());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { themes, loading, error, refresh };
}
