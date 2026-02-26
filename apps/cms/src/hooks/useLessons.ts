import { useState, useEffect, useCallback } from 'react';
import type { Lesson } from '@kidspark/shared';
import { api } from '../lib/api';

export function useLessons(courseId?: number) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setLessons(await api.lessons.list(courseId));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { refresh(); }, [refresh]);

    return { lessons, loading, error, refresh };
}
