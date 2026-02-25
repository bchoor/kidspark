import type { Env } from '../env';

export async function createSession(
  env: Env,
  kidId: number,
  passwordId: number
): Promise<string> {
  const tokenBuffer = new Uint8Array(32);
  crypto.getRandomValues(tokenBuffer);
  const token = Array.from(tokenBuffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await env.DB.prepare(
    `INSERT INTO sessions (id, kid_id, password_id, created_at, expires_at)
     VALUES (?, ?, ?, datetime('now'), datetime('now', '+7 days'))`
  ).bind(token, kidId, passwordId).run();

  return token;
}

export async function validateSession(
  env: Env,
  sessionToken: string
): Promise<{ kidId: number; passwordId: number } | null> {
  const result = await env.DB.prepare(
    `SELECT kid_id, password_id FROM sessions
     WHERE id = ? AND expires_at > datetime('now')`
  ).bind(sessionToken).first<{ kid_id: number; password_id: number }>();

  if (!result) return null;
  return { kidId: result.kid_id, passwordId: result.password_id };
}

export async function revokeSession(env: Env, sessionToken: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionToken).run();
}
