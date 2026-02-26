import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

export async function handleThemes(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;

    if (subpath === '' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, name, icon_key, color_palette, description, created_at FROM themes ORDER BY name ASC`
        ).all();
        return json({ data: result.results });
    }

    if (subpath === '' && method === 'POST') {
        let body: {
            name?: string;
            icon_key?: string;
            color_palette?: string;
            description?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.name) return json({ error: 'name required' }, 400);

        const result = await env.DB.prepare(
            `INSERT INTO themes (name, icon_key, color_palette, description, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
        )
            .bind(body.name, body.icon_key ?? null, body.color_palette ?? '{}', body.description ?? '')
            .run();

        const newTheme = await env.DB.prepare(`SELECT * FROM themes WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newTheme }, 201);
    }

    const idMatch = subpath.match(/^\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    if (idMatch && method === 'GET') {
        const theme = await env.DB.prepare(`SELECT * FROM themes WHERE id = ?`).bind(id).first();
        if (!theme) return json({ error: 'Not found' }, 404);
        return json({ data: theme });
    }

    if (idMatch && method === 'PUT') {
        let body: {
            name?: string;
            icon_key?: string;
            color_palette?: string;
            description?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        await env.DB.prepare(
            `UPDATE themes SET
         name = COALESCE(?, name), icon_key = COALESCE(?, icon_key),
         color_palette = COALESCE(?, color_palette), description = COALESCE(?, description)
       WHERE id = ?`
        )
            .bind(
                body.name ?? null,
                body.icon_key ?? null,
                body.color_palette ?? null,
                body.description ?? null,
                id
            )
            .run();

        const updated = await env.DB.prepare(`SELECT * FROM themes WHERE id = ?`).bind(id).first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM themes WHERE id = ?`).bind(id).run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
