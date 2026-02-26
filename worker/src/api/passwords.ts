import type { Env } from '../env';
import { json } from '../lib/json';
import { requireAdmin } from '../auth';
import { hashPassword } from '../lib/password';

export async function handlePasswords(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const guard = await requireAdmin(request, env);
    if (guard) return guard;

    const method = request.method;

    // GET /api/admin/passwords — list without hash/salt
    if (subpath === '' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, label, created_at, last_used_at FROM access_passwords ORDER BY created_at DESC`
        ).all();
        return json({ data: result.results });
    }

    // POST /api/admin/passwords — create new access password
    if (subpath === '' && method === 'POST') {
        let body: { label?: string; password?: string };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }
        if (!body.label || !body.password) {
            return json({ error: 'label and password required' }, 400);
        }

        const { hash, salt, iterations } = await hashPassword(body.password);
        const result = await env.DB.prepare(
            `INSERT INTO access_passwords (label, password_hash, salt, iterations, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
        )
            .bind(body.label, hash, salt, iterations)
            .run();

        const newPw = await env.DB.prepare(
            `SELECT id, label, created_at, last_used_at FROM access_passwords WHERE id = ?`
        )
            .bind(result.meta.last_row_id)
            .first();
        return json({ data: newPw }, 201);
    }

    // DELETE /api/admin/passwords/:id
    const idMatch = subpath.match(/^\/(\d+)$/);
    if (idMatch && method === 'DELETE') {
        const result = await env.DB.prepare(`DELETE FROM access_passwords WHERE id = ?`)
            .bind(parseInt(idMatch[1]))
            .run();
        if (result.meta.changes === 0) return json({ error: 'Not found' }, 404);
        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
