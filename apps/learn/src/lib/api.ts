import type { Course, Lesson, Kid, Progress } from '@kidspark/shared';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

type Wrapped<T> = { data: T };

export const api = {
    auth: {
        verify: (password: string, kidId: number) =>
            apiFetch<{ ok: boolean }>('/api/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ password, kid_id: kidId }),
            }),
        check: () =>
            apiFetch<{ authenticated: boolean; kid_id?: number }>('/api/auth/check'),
        logout: () =>
            apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    },

    kids: {
        list: () =>
            apiFetch<Wrapped<Kid[]>>('/api/learn/kids').then((r) => r.data),
    },

    courses: {
        list: () =>
            apiFetch<Wrapped<Course[]>>('/api/learn/courses').then((r) => r.data),
        get: (slug: string) =>
            apiFetch<Wrapped<Course & { lessons: Lesson[] }>>(
                `/api/learn/courses/${slug}`
            ).then((r) => r.data),
    },

    lessons: {
        get: (id: number) =>
            apiFetch<Wrapped<Lesson>>(`/api/learn/lessons/${id}`).then((r) => r.data),
    },

    progress: {
        list: () =>
            apiFetch<Wrapped<Progress[]>>('/api/learn/progress').then((r) => r.data),
        upsert: (lessonId: number, data: Partial<Progress>) =>
            apiFetch<Wrapped<Progress>>(`/api/learn/progress/${lessonId}`, {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),
    },

    media: {
        url: (r2Key: string) => `/api/media/${r2Key}`,
    },
};
