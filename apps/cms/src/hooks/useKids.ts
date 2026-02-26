import { useState, useEffect, useCallback } from 'react';
import type { Kid } from '@kidspark/shared';
import { api } from '../lib/api';

export function useKids() {
    const [kids, setKids] = useState<Kid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setKids(await api.kids.list());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { kids, loading, error, refresh };
}
