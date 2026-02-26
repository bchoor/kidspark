import type {
    Course,
    Topic,
    Theme,
    Lesson,
    Kid,
    AccessPassword,
    Media,
    Progress,
} from '@kidspark/shared';

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(path, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

type Wrapped<T> = { data: T };

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const api = {
    auth: {
        login: (password: string) =>
            apiFetch<{ ok: boolean }>('/api/auth/admin/login', {
                method: 'POST',
                body: JSON.stringify({ password }),
            }),

        logout: () =>
            apiFetch<{ ok: boolean }>('/api/auth/admin/logout', { method: 'POST' }),

        check: () =>
            apiFetch<{ authenticated: boolean }>('/api/auth/admin/check'),
    },

    // ─── Courses ─────────────────────────────────────────────────────────────

    courses: {
        list: () =>
            apiFetch<Wrapped<Course[]>>('/api/admin/courses').then((r) => r.data),

        get: (id: number) =>
            apiFetch<Wrapped<Course>>(`/api/admin/courses/${id}`).then((r) => r.data),

        create: (data: Partial<Course>) =>
            apiFetch<Wrapped<Course>>('/api/admin/courses', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        update: (id: number, data: Partial<Course>) =>
            apiFetch<Wrapped<Course>>(`/api/admin/courses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/courses/${id}`, {
                method: 'DELETE',
            }),
    },

    // ─── Topics ──────────────────────────────────────────────────────────────

    topics: {
        list: () =>
            apiFetch<Wrapped<Topic[]>>('/api/admin/topics').then((r) => r.data),

        get: (id: number) =>
            apiFetch<Wrapped<Topic>>(`/api/admin/topics/${id}`).then((r) => r.data),

        create: (data: Partial<Topic>) =>
            apiFetch<Wrapped<Topic>>('/api/admin/topics', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        update: (id: number, data: Partial<Topic>) =>
            apiFetch<Wrapped<Topic>>(`/api/admin/topics/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/topics/${id}`, {
                method: 'DELETE',
            }),
    },

    // ─── Themes ──────────────────────────────────────────────────────────────

    themes: {
        list: () =>
            apiFetch<Wrapped<Theme[]>>('/api/admin/themes').then((r) => r.data),

        get: (id: number) =>
            apiFetch<Wrapped<Theme>>(`/api/admin/themes/${id}`).then((r) => r.data),

        create: (data: Partial<Theme>) =>
            apiFetch<Wrapped<Theme>>('/api/admin/themes', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        update: (id: number, data: Partial<Theme>) =>
            apiFetch<Wrapped<Theme>>(`/api/admin/themes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/themes/${id}`, {
                method: 'DELETE',
            }),
    },

    // ─── Lessons ─────────────────────────────────────────────────────────────

    lessons: {
        list: (courseId?: number) => {
            const qs = courseId ? `?course_id=${courseId}` : '';
            return apiFetch<Wrapped<Lesson[]>>(`/api/admin/lessons${qs}`).then(
                (r) => r.data
            );
        },

        get: (id: number) =>
            apiFetch<Wrapped<Lesson>>(`/api/admin/lessons/${id}`).then((r) => r.data),

        create: (data: Partial<Lesson>) =>
            apiFetch<Wrapped<Lesson>>('/api/admin/lessons', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        update: (id: number, data: Partial<Lesson>) =>
            apiFetch<Wrapped<Lesson>>(`/api/admin/lessons/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/lessons/${id}`, {
                method: 'DELETE',
            }),

        publish: (id: number) =>
            apiFetch<Wrapped<Lesson>>(`/api/admin/lessons/${id}/publish`, {
                method: 'POST',
            }).then((r) => r.data),

        unpublish: (id: number) =>
            apiFetch<Wrapped<Lesson>>(`/api/admin/lessons/${id}/unpublish`, {
                method: 'POST',
            }).then((r) => r.data),
    },

    // ─── Kids ─────────────────────────────────────────────────────────────────

    kids: {
        list: () =>
            apiFetch<Wrapped<Kid[]>>('/api/admin/kids').then((r) => r.data),

        get: (id: number) =>
            apiFetch<Wrapped<Kid>>(`/api/admin/kids/${id}`).then((r) => r.data),

        create: (data: Partial<Kid>) =>
            apiFetch<Wrapped<Kid>>('/api/admin/kids', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        update: (id: number, data: Partial<Kid>) =>
            apiFetch<Wrapped<Kid>>(`/api/admin/kids/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/kids/${id}`, { method: 'DELETE' }),
    },

    // ─── Passwords ───────────────────────────────────────────────────────────

    passwords: {
        list: () =>
            apiFetch<Wrapped<AccessPassword[]>>('/api/admin/passwords').then(
                (r) => r.data
            ),

        create: (data: { label: string; password: string }) =>
            apiFetch<Wrapped<AccessPassword>>('/api/admin/passwords', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((r) => r.data),

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/passwords/${id}`, {
                method: 'DELETE',
            }),
    },

    // ─── Media ───────────────────────────────────────────────────────────────

    media: {
        list: (lessonId: number) =>
            apiFetch<Wrapped<Media[]>>(
                `/api/admin/media?lesson_id=${lessonId}`
            ).then((r) => r.data),

        upload: async (lessonId: number, file: File): Promise<Media> => {
            const res = await fetch(
                `/api/admin/media?lesson_id=${lessonId}&filename=${encodeURIComponent(file.name)}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': file.type },
                    body: await file.arrayBuffer(),
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    (body as { error?: string }).error ?? `Upload failed: HTTP ${res.status}`
                );
            }
            return res.json().then((r: Wrapped<Media>) => r.data);
        },

        delete: (id: number) =>
            apiFetch<{ ok: boolean }>(`/api/admin/media/${id}`, {
                method: 'DELETE',
            }),

        url: (r2Key: string) => `/api/media/${r2Key}`,
    },
};
