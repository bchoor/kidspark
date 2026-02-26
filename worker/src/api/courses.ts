import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function handleCourses(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;

    // GET /api/admin/courses
    if (subpath === '' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, title, description, slug, cover_image_key, status, sort_order, created_at, updated_at
       FROM courses ORDER BY sort_order ASC, created_at DESC`
        ).all();
        return json({ data: result.results });
    }

    // POST /api/admin/courses
    if (subpath === '' && method === 'POST') {
        let body: {
            title?: string;
            description?: string;
            cover_image_key?: string;
            status?: string;
            sort_order?: number;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.title) return json({ error: 'title required' }, 400);

        const slug = slugify(body.title);
        const result = await env.DB.prepare(
            `INSERT INTO courses (title, description, slug, cover_image_key, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        )
            .bind(
                body.title,
                body.description ?? '',
                slug,
                body.cover_image_key ?? null,
                body.status ?? 'draft',
                body.sort_order ?? 0
            )
            .run();

        const newCourse = await env.DB.prepare(`SELECT * FROM courses WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newCourse }, 201);
    }

    const idMatch = subpath.match(/^\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    // GET /api/admin/courses/:id
    if (idMatch && method === 'GET') {
        const course = await env.DB.prepare(`SELECT * FROM courses WHERE id = ?`).bind(id).first();
        if (!course) return json({ error: 'Not found' }, 404);
        return json({ data: course });
    }

    // PUT /api/admin/courses/:id
    if (idMatch && method === 'PUT') {
        let body: {
            title?: string;
            description?: string;
            cover_image_key?: string;
            status?: string;
            sort_order?: number;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        await env.DB.prepare(
            `UPDATE courses SET
         title = COALESCE(?, title), description = COALESCE(?, description),
         cover_image_key = COALESCE(?, cover_image_key), status = COALESCE(?, status),
         sort_order = COALESCE(?, sort_order), updated_at = datetime('now')
       WHERE id = ?`
        )
            .bind(
                body.title ?? null,
                body.description ?? null,
                body.cover_image_key ?? null,
                body.status ?? null,
                body.sort_order ?? null,
                id
            )
            .run();

        const updated = await env.DB.prepare(`SELECT * FROM courses WHERE id = ?`).bind(id).first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    // DELETE /api/admin/courses/:id
    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM courses WHERE id = ?`).bind(id).run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
