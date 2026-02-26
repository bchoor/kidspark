import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

export async function handleTopics(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;

    if (subpath === '' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, title, description, age_min, age_max, status, created_at, updated_at
       FROM topics ORDER BY title ASC`
        ).all();
        return json({ data: result.results });
    }

    if (subpath === '' && method === 'POST') {
        let body: {
            title?: string;
            description?: string;
            age_min?: number;
            age_max?: number;
            status?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.title) return json({ error: 'title required' }, 400);

        const result = await env.DB.prepare(
            `INSERT INTO topics (title, description, age_min, age_max, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        )
            .bind(
                body.title,
                body.description ?? '',
                body.age_min ?? 3,
                body.age_max ?? 12,
                body.status ?? 'draft'
            )
            .run();

        const newTopic = await env.DB.prepare(`SELECT * FROM topics WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newTopic }, 201);
    }

    const idMatch = subpath.match(/^\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (idMatch && method === 'GET') {
        const topic = await env.DB.prepare(`SELECT * FROM topics WHERE id = ?`).bind(id).first();
        if (!topic) return json({ error: 'Not found' }, 404);
        return json({ data: topic });
    }

    if (idMatch && method === 'PUT') {
        let body: {
            title?: string;
            description?: string;
            age_min?: number;
            age_max?: number;
            status?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        await env.DB.prepare(
            `UPDATE topics SET
         title = COALESCE(?, title), description = COALESCE(?, description),
         age_min = COALESCE(?, age_min), age_max = COALESCE(?, age_max),
         status = COALESCE(?, status), updated_at = datetime('now')
       WHERE id = ?`
        )
            .bind(
                body.title ?? null,
                body.description ?? null,
                body.age_min ?? null,
                body.age_max ?? null,
                body.status ?? null,
                id
            )
            .run();

        const updated = await env.DB.prepare(`SELECT * FROM topics WHERE id = ?`).bind(id).first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM topics WHERE id = ?`).bind(id).run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
