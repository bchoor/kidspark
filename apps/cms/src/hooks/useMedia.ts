import { useState, useEffect, useCallback } from 'react';
import type { Media } from '@kidspark/shared';
import { api } from '../lib/api';

export function useMedia(lessonId: number | null) {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            setMedia(await api.media.list(lessonId));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => { refresh(); }, [refresh]);

    const upload = useCallback(async (file: File) => {
        if (!lessonId) throw new Error('No lesson selected');
        setUploading(true);
        try {
            const m = await api.media.upload(lessonId, file);
            setMedia((prev) => [m, ...prev]);
            return m;
        } finally {
            setUploading(false);
        }
    }, [lessonId]);

    const remove = useCallback(async (id: number) => {
        await api.media.delete(id);
        setMedia((prev) => prev.filter((m) => m.id !== id));
    }, []);

    return { media, loading, uploading, error, upload, remove, refresh };
}
