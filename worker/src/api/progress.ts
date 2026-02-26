import type { Env } from '../env';
import { json } from '../lib/json';
import { requireKidSession } from '../auth';

export async function handleProgress(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const sessionOrResponse = await requireKidSession(request, env);
    if (sessionOrResponse instanceof Response) return sessionOrResponse;
    const { kidId } = sessionOrResponse;

    const method = request.method;

    // GET /api/learn/progress — all progress for current kid
    if (subpath === '/progress' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT lesson_id, status, score, time_spent_seconds, started_at, completed_at
       FROM progress WHERE kid_id = ?`
        )
            .bind(kidId)
            .all();
        return json({ data: result.results });
    }

    const progressMatch = subpath.match(/^\/progress\/(\d+)$/);

    // GET /api/learn/progress/:lessonId
    if (progressMatch && method === 'GET') {
        const lessonId = parseInt(progressMatch[1]);
        const row = await env.DB.prepare(
            `SELECT lesson_id, status, score, time_spent_seconds, answers_json, started_at, completed_at
       FROM progress WHERE kid_id = ? AND lesson_id = ?`
        )
            .bind(kidId, lessonId)
            .first();
        return json({ data: row ?? null });
    }

    // POST /api/learn/progress/:lessonId — upsert
    if (progressMatch && method === 'POST') {
        const lessonId = parseInt(progressMatch[1]);
        let body: {
            status?: string;
            score?: number;
            time_spent_seconds?: number;
            answers_json?: string;
        };
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        const status = body.status ?? 'in_progress';

        await env.DB.prepare(
            `INSERT INTO progress (kid_id, lesson_id, status, score, time_spent_seconds, answers_json, started_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), CASE WHEN ? = 'completed' THEN datetime('now') ELSE NULL END)
       ON CONFLICT(kid_id, lesson_id) DO UPDATE SET
         status = excluded.status,
         score = COALESCE(excluded.score, score),
         time_spent_seconds = excluded.time_spent_seconds,
         answers_json = COALESCE(excluded.answers_json, answers_json),
         completed_at = CASE WHEN excluded.status = 'completed' AND completed_at IS NULL THEN datetime('now') ELSE completed_at END`
        )
            .bind(
                kidId,
                lessonId,
                status,
                body.score ?? null,
                body.time_spent_seconds ?? 0,
                body.answers_json ?? null,
                status
            )
            .run();

        return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
}
