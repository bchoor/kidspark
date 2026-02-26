// Debounced progress save utility
import { api } from './api';
import type { Progress } from '@kidspark/shared';

const pending = new Map<number, ReturnType<typeof setTimeout>>();
const pendingData = new Map<number, Partial<Progress>>();

export function saveProgress(lessonId: number, data: Partial<Progress>): void {
    // Merge with any existing pending data
    const existing = pendingData.get(lessonId) ?? {};
    pendingData.set(lessonId, { ...existing, ...data });

    // Clear existing timer
    const timer = pending.get(lessonId);
    if (timer) clearTimeout(timer);

    // Schedule flush in 2s
    pending.set(
        lessonId,
        setTimeout(() => {
            flushProgress(lessonId);
        }, 2000)
    );
}

export function flushProgress(lessonId: number): void {
    const timer = pending.get(lessonId);
    if (timer) clearTimeout(timer);
    pending.delete(lessonId);

    const data = pendingData.get(lessonId);
    if (!data) return;
    pendingData.delete(lessonId);

    api.progress.upsert(lessonId, data).catch(console.error);
}

export function flushAll(): void {
    for (const lessonId of pending.keys()) {
        flushProgress(lessonId);
    }
}
