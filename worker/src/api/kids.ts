import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

export async function handleKids(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;

    if (subpath === '' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, name, avatar, age, created_at FROM kids ORDER BY name ASC`
        ).all();
        return json({ data: result.results });
    }

    if (subpath === '' && method === 'POST') {
        let body: { name?: string; avatar?: string; age?: number };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.name || body.age === undefined) {
            return json({ error: 'name and age required' }, 400);
        }

        const result = await env.DB.prepare(
            `INSERT INTO kids (name, avatar, age, created_at) VALUES (?, ?, ?, datetime('now'))`
        )
            .bind(body.name, body.avatar ?? null, body.age)
            .run();

        const newKid = await env.DB.prepare(`SELECT * FROM kids WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newKid }, 201);
    }

    const idMatch = subpath.match(/^\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (idMatch && method === 'GET') {
        const kid = await env.DB.prepare(
            `SELECT id, name, avatar, age, created_at FROM kids WHERE id = ?`
        )
            .bind(id)
            .first();
        if (!kid) return json({ error: 'Not found' }, 404);
        return json({ data: kid });
    }

    if (idMatch && method === 'PUT') {
        let body: { name?: string; avatar?: string; age?: number };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        await env.DB.prepare(
            `UPDATE kids SET
         name = COALESCE(?, name), avatar = COALESCE(?, avatar), age = COALESCE(?, age)
       WHERE id = ?`
        )
            .bind(body.name ?? null, body.avatar ?? null, body.age ?? null, id)
            .run();

        const updated = await env.DB.prepare(
            `SELECT id, name, avatar, age, created_at FROM kids WHERE id = ?`
        )
            .bind(id)
            .first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM kids WHERE id = ?`).bind(id).run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
