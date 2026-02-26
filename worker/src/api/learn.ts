import type { Env } from '../env';
import { json } from '../lib/json';
import { requireKidSession } from '../auth';

export async function handleLearn(
    request: Request,
    env: Env,
    subpath: string
): Promise<Response> {
    const method = request.method;

    // GET /api/learn/kids — PUBLIC: list kids so password gate can show selector before login
    if (subpath === '/kids' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, name, avatar, age FROM kids ORDER BY name ASC`
        ).all();
        return json({ data: result.results });
    }

    // All other learn routes require an active kid session
    const sessionOrResponse = await requireKidSession(request, env);
    if (sessionOrResponse instanceof Response) return sessionOrResponse;

    // GET /api/learn/courses — list published courses
    if (subpath === '/courses' && method === 'GET') {
        const result = await env.DB.prepare(
            `SELECT id, title, description, slug, cover_image_key, sort_order
       FROM courses WHERE status = 'published' ORDER BY sort_order ASC`
        ).all();
        return json({ data: result.results });
    }

    // GET /api/learn/courses/:slug
    const courseSlugMatch = subpath.match(/^\/courses\/([^/]+)$/);
    if (courseSlugMatch && method === 'GET') {
        const slug = courseSlugMatch[1];
        const course = await env.DB.prepare(
            `SELECT id, title, description, slug, cover_image_key, sort_order
       FROM courses WHERE slug = ? AND status = 'published'`
        )
            .bind(slug)
            .first<{ id: number; title: string; description: string; slug: string; cover_image_key: string | null; sort_order: number }>();

        if (!course) return json({ error: 'Not found' }, 404);

        const lessons = await env.DB.prepare(
            `SELECT id, title, slug, sort_order, activity_type
       FROM lessons WHERE course_id = ? AND status = 'published' ORDER BY sort_order ASC`
        )
            .bind(course.id)
            .all();

        return json({ data: { ...course, lessons: lessons.results } });
    }

    // GET /api/learn/lessons/:id
    const lessonMatch = subpath.match(/^\/lessons\/(\d+)$/);
    if (lessonMatch && method === 'GET') {
        const id = parseInt(lessonMatch[1]);
        const lesson = await env.DB.prepare(
            `SELECT l.id, l.title, l.slug, l.sort_order, l.activity_type, l.content_json, l.hints_json,
                    c.slug as course_slug,
                    (SELECT id FROM lessons WHERE course_id = l.course_id AND sort_order > l.sort_order AND status = 'published' ORDER BY sort_order ASC LIMIT 1) as next_lesson_id
             FROM lessons l
             JOIN courses c ON l.course_id = c.id
             WHERE l.id = ? AND l.status = 'published'`
        )
            .bind(id)
            .first<any>();

        if (!lesson) return json({ error: 'Not found' }, 404);

        if (lesson.content_json === '{}') {
            lesson.content_json = null;
        }

        return json({ data: lesson });
    }

    return json({ error: 'Not found' }, 404);
}
