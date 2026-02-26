import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';

function generateKey(lessonId: number, filename: string): string {
    const uuid = crypto.randomUUID();
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `lessons/${lessonId}/${uuid}_${safe}`;
}

export async function handleMediaAdmin(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;
    const url = new URL(request.url);

    // GET /api/admin/media?lesson_id=X
    if (method === 'GET') {
        const lessonId = url.searchParams.get('lesson_id');
        if (!lessonId) return json({ error: 'lesson_id required' }, 400);
        const result = await env.DB.prepare(
            `SELECT id, lesson_id, filename, r2_key, mime_type, size_bytes, created_at
       FROM media WHERE lesson_id = ? ORDER BY created_at DESC`
        )
            .bind(parseInt(lessonId))
            .all();
        return json({ data: result.results });
    }

    // POST /api/admin/media?lesson_id=X&filename=Y
    if (method === 'POST') {
        const lessonId = url.searchParams.get('lesson_id');
        if (!lessonId) return json({ error: 'lesson_id required' }, 400);

        const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream';
        const filename = url.searchParams.get('filename') ?? 'upload';
        const key = generateKey(parseInt(lessonId), filename);

        const body = await request.arrayBuffer();
        if (!body.byteLength) return json({ error: 'Empty body' }, 400);

        await env.MEDIA.put(key, body, { httpMetadata: { contentType } });

        const result = await env.DB.prepare(
            `INSERT INTO media (lesson_id, filename, r2_key, mime_type, size_bytes, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
        )
            .bind(parseInt(lessonId), filename, key, contentType, body.byteLength)
            .run();

        const newMedia = await env.DB.prepare(`SELECT * FROM media WHERE id = ?`)
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newMedia }, 201);
    }

    // DELETE /api/admin/media/:id
    const idMatch = subpath.match(/^\/(\d+)$/);
    if (idMatch && method === 'DELETE') {
        const id = parseInt(idMatch[1]);
        const row = await env.DB.prepare(`SELECT r2_key FROM media WHERE id = ?`)
            .bind(id)
            .first<{ r2_key: string }>();
        if (!row) return json({ error: 'Not found' }, 404);

        await env.MEDIA.delete(row.r2_key);
        await env.DB.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run();
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}

export async function handleMediaServe(
    request: Request,
    env: Env,
    key: string
): Promise<Response> {
    const object = await env.MEDIA.get(key);
    if (!object) return new Response('Not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
}
