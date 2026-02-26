import type { Env } from '../env';
import { json } from '../lib/json';
import { verifyPassword } from '../lib/password';
import { createSession, revokeSession, validateSession } from '../lib/session';
import { parseCookie } from '../auth';

function kidCookie(token: string, maxAge: number): string {
    return `ks_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export async function handleSession(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const method = request.method;

    // POST /api/auth/verify — verify access password + select kid, create session
    if (subpath === '/verify' && method === 'POST') {
        let body: { password?: string; kid_id?: number };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        if (!body.password || !body.kid_id) {
            return json({ error: 'password and kid_id required' }, 400);
        }

        const passwords = await env.DB.prepare(
            `SELECT id, password_hash, salt, iterations FROM access_passwords`
        ).all<{ id: number; password_hash: string; salt: string; iterations: number }>();

        let matchedId: number | null = null;
        for (const pw of passwords.results) {
            const ok = await verifyPassword(body.password, pw.password_hash, pw.salt, pw.iterations);
            if (ok) {
                matchedId = pw.id;
                break;
            }
        }
        if (!matchedId) return json({ error: 'Invalid password' }, 401);

        const kid = await env.DB.prepare(`SELECT id FROM kids WHERE id = ?`)
            .bind(body.kid_id)
            .first<{ id: number }>();
        if (!kid) return json({ error: 'Kid not found' }, 404);

        await env.DB.prepare(
            `UPDATE access_passwords SET last_used_at = datetime('now') WHERE id = ?`
        )
            .bind(matchedId)
            .run();

        const token = await createSession(env, body.kid_id, matchedId);

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': kidCookie(token, 604800),
                'Cache-Control': 'no-store',
            },
        });
    }

    // POST /api/auth/logout
    if (subpath === '/logout' && method === 'POST') {
        const cookie = parseCookie(request.headers.get('Cookie'), 'ks_session');
        if (cookie) await revokeSession(env, cookie);
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': kidCookie('', 0),
                'Cache-Control': 'no-store',
            },
        });
    }

    // GET /api/auth/check
    if (subpath === '/check' && method === 'GET') {
        const cookie = parseCookie(request.headers.get('Cookie'), 'ks_session');
        if (!cookie) return json({ authenticated: false });

        const session = await validateSession(env, cookie);
        if (!session) return json({ authenticated: false });

        const kid = await env.DB.prepare(
            `SELECT id, name, avatar, age FROM kids WHERE id = ?`
        )
            .bind(session.kidId)
            .first<{ id: number; name: string; avatar: string | null; age: number }>();

        return json({ authenticated: true, kid });
    }

    return json({ error: 'Not found' }, 404);
}
