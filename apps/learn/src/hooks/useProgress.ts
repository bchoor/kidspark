import { useState, useEffect, useCallback } from 'react';
import type { Progress } from '@kidspark/shared';
import { api } from '../lib/api';

export function useProgress() {
    const [progressMap, setProgressMap] = useState<Map<number, Progress>>(new Map());
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const list = await api.progress.list();
            const map = new Map(list.map((p) => [p.lesson_id, p]));
            setProgressMap(map);
        } catch {
            // Not blocking — just no progress data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const getProgress = useCallback(
        (lessonId: number): Progress | undefined => progressMap.get(lessonId),
        [progressMap]
    );

    return { progressMap, loading, getProgress, refresh };
}
