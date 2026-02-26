import type { Env } from './env';
import { json } from './lib/json';
import { validateSession } from './lib/session';

export function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  const cookie = parseCookie(request.headers.get('Cookie'), 'ks_admin');
  if (!cookie) return json({ error: 'Unauthorized' }, 401);

  const session = await env.DB.prepare(
    `SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime('now')`
  )
    .bind(cookie)
    .first<{ id: string }>();

  if (!session) return json({ error: 'Unauthorized' }, 401);
  return null;
}

export async function requireKidSession(
  request: Request,
  env: Env
): Promise<{ kidId: number; passwordId: number } | Response> {
  const cookie = parseCookie(request.headers.get('Cookie'), 'ks_session');
  if (!cookie) return json({ error: 'Unauthorized' }, 401);

  const session = await validateSession(env, cookie);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  return session;
}
