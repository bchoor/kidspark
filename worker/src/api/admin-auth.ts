import type { Env } from '../env';
import { json } from '../lib/json';
import { parseCookie } from '../auth';

function adminCookie(token: string, maxAge: number): string {
    return `ks_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export async function handleAdminAuth(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const method = request.method;

    // POST /api/auth/admin/login
    if (subpath === '/login' && method === 'POST') {
        let body: { password?: string };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        if (!body.password || body.password !== env.ADMIN_PASSWORD) {
            return json({ error: 'Invalid password' }, 401);
        }

        const tokenBytes = new Uint8Array(32);
        crypto.getRandomValues(tokenBytes);
        const token = Array.from(tokenBytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        await env.DB.prepare(
            `INSERT INTO admin_sessions (id, created_at, expires_at) VALUES (?, datetime('now'), datetime('now', '+24 hours'))`
        )
            .bind(token)
            .run();

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': adminCookie(token, 86400),
                'Cache-Control': 'no-store',
            },
        });
    }

    // POST /api/auth/admin/logout
    if (subpath === '/logout' && method === 'POST') {
        const cookie = parseCookie(request.headers.get('Cookie'), 'ks_admin');
        if (cookie) {
            await env.DB.prepare(`DELETE FROM admin_sessions WHERE id = ?`).bind(cookie).run();
        }
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': adminCookie('', 0),
                'Cache-Control': 'no-store',
            },
        });
    }

    // GET /api/auth/admin/check
    if (subpath === '/check' && method === 'GET') {
        const cookie = parseCookie(request.headers.get('Cookie'), 'ks_admin');
        if (!cookie) return json({ authenticated: false });

        const session = await env.DB.prepare(
            `SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime('now')`
        )
            .bind(cookie)
            .first<{ id: string }>();

        return json({ authenticated: !!session });
    }

    return json({ error: 'Not found' }, 404);
}
