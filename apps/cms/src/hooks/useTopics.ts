import { useState, useEffect, useCallback } from 'react';
import type { Topic } from '@kidspark/shared';
import { api } from '../lib/api';

export function useTopics() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setTopics(await api.topics.list());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { topics, loading, error, refresh };
}
