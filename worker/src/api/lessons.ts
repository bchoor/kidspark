import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function handleLessons(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;
    const url = new URL(request.url);

    // GET /api/admin/lessons?course_id=X
    if (subpath === '' && method === 'GET') {
        const courseId = url.searchParams.get('course_id');
        const query = courseId
            ? `SELECT id, course_id, topic_id, theme_id, title, slug, sort_order, status, activity_type, created_at, updated_at, published_at
         FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, created_at DESC`
            : `SELECT id, course_id, topic_id, theme_id, title, slug, sort_order, status, activity_type, created_at, updated_at, published_at
         FROM lessons ORDER BY sort_order ASC, created_at DESC`;
        const result = courseId
            ? await env.DB.prepare(query).bind(parseInt(courseId)).all()
            : await env.DB.prepare(query).all();
        return json({ data: result.results });
    }

    // POST /api/admin/lessons
    if (subpath === '' && method === 'POST') {
        let body: {
            course_id?: number;
            topic_id?: number;
            theme_id?: number;
            title?: string;
            sort_order?: number;
            activity_type?: string;
            content_json?: string;
            hints_json?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.course_id || !body.topic_id || !body.theme_id || !body.title || !body.activity_type) {
            return json({ error: 'course_id, topic_id, theme_id, title, activity_type required' }, 400);
        }

        const slug = slugify(body.title);
        const result = await env.DB.prepare(
            `INSERT INTO lessons (course_id, topic_id, theme_id, title, slug, sort_order, status, activity_type, content_json, hints_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, datetime('now'), datetime('now'))`
        )
            .bind(
                body.course_id,
                body.topic_id,
                body.theme_id,
                body.title,
                slug,
                body.sort_order ?? 0,
                body.activity_type,
                body.content_json ?? '{}',
                body.hints_json ?? null
            )
            .run();

        const newLesson = await env.DB.prepare(`SELECT * FROM lessons WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newLesson }, 201);
    }

    // Publish/unpublish: /api/admin/lessons/:id/publish or /unpublish
    const publishMatch = subpath.match(/^\/(\d+)\/(publish|unpublish)$/);
    if (publishMatch && method === 'POST') {
        const lessonId = parseInt(publishMatch[1]);
        const action = publishMatch[2];

        if (action === 'publish') {
            await env.DB.prepare(
                `UPDATE lessons SET status = 'published', published_at = COALESCE(published_at, datetime('now')), updated_at = datetime('now') WHERE id = ?`
            )
                .bind(lessonId)
                .run();
        } else {
            await env.DB.prepare(
                `UPDATE lessons SET status = 'draft', updated_at = datetime('now') WHERE id = ?`
            )
                .bind(lessonId)
                .run();
        }

        const updated = await env.DB.prepare(`SELECT * FROM lessons WHERE id = ?`)
            .bind(lessonId)
            .first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    const idMatch = subpath.match(/^\/(\d+)$/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    // GET /api/admin/lessons/:id
    if (idMatch && method === 'GET') {
        const lesson = await env.DB.prepare(`SELECT * FROM lessons WHERE id = ?`).bind(id).first();
        if (!lesson) return json({ error: 'Not found' }, 404);
        return json({ data: lesson });
    }

    // PUT /api/admin/lessons/:id
    if (idMatch && method === 'PUT') {
        let body: {
            topic_id?: number;
            theme_id?: number;
            title?: string;
            sort_order?: number;
            activity_type?: string;
            content_json?: string;
            hints_json?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        await env.DB.prepare(
            `UPDATE lessons SET
         topic_id = COALESCE(?, topic_id), theme_id = COALESCE(?, theme_id),
         title = COALESCE(?, title), sort_order = COALESCE(?, sort_order),
         activity_type = COALESCE(?, activity_type),
         content_json = COALESCE(?, content_json), hints_json = COALESCE(?, hints_json),
         updated_at = datetime('now')
       WHERE id = ?`
        )
            .bind(
                body.topic_id ?? null,
                body.theme_id ?? null,
                body.title ?? null,
                body.sort_order ?? null,
                body.activity_type ?? null,
                body.content_json ?? null,
                body.hints_json ?? null,
                id
            )
            .run();

        const updated = await env.DB.prepare(`SELECT * FROM lessons WHERE id = ?`).bind(id).first();
        if (!updated) return json({ error: 'Not found' }, 404);
        return json({ data: updated });
    }

    // DELETE /api/admin/lessons/:id
    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM lessons WHERE id = ?`).bind(id).run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
