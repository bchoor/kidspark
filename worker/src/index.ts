import type { Env } from './env';
import { json } from './lib/json';
import { handleAdminAuth } from './api/admin-auth';
import { handleSession } from './api/session';
import { handleCourses } from './api/courses';
import { handleTopics } from './api/topics';
import { handleThemes } from './api/themes';
import { handleLessons } from './api/lessons';
import { handleKids } from './api/kids';
import { handlePasswords } from './api/passwords';
import { handleLearn } from './api/learn';
import { handleProgress } from './api/progress';
import { handleMediaAdmin, handleMediaServe } from './api/media';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Auth routes
      if (path.startsWith('/api/auth/admin')) {
        const subpath = path.slice('/api/auth/admin'.length) || '';
        return handleAdminAuth(request, env, subpath);
      }

      if (path.startsWith('/api/auth')) {
        const subpath = path.slice('/api/auth'.length) || '';
        return handleSession(request, env, subpath);
      }

      // Admin CRUD routes
      if (path.startsWith('/api/admin/courses')) {
        const subpath = path.slice('/api/admin/courses'.length) || '';
        return handleCourses(request, env, subpath);
      }

      if (path.startsWith('/api/admin/topics')) {
        const subpath = path.slice('/api/admin/topics'.length) || '';
        return handleTopics(request, env, subpath);
      }

      if (path.startsWith('/api/admin/themes')) {
        const subpath = path.slice('/api/admin/themes'.length) || '';
        return handleThemes(request, env, subpath);
      }

      if (path.startsWith('/api/admin/lessons')) {
        const subpath = path.slice('/api/admin/lessons'.length) || '';
        return handleLessons(request, env, subpath);
      }

      if (path.startsWith('/api/admin/kids')) {
        const subpath = path.slice('/api/admin/kids'.length) || '';
        return handleKids(request, env, subpath);
      }

      if (path.startsWith('/api/admin/passwords')) {
        const subpath = path.slice('/api/admin/passwords'.length) || '';
        return handlePasswords(request, env, subpath);
      }

      if (path.startsWith('/api/admin/media')) {
        const subpath = path.slice('/api/admin/media'.length) || '';
        return handleMediaAdmin(request, env, subpath);
      }

      // Learn routes (kid-facing, session-protected)
      if (path.startsWith('/api/learn/progress')) {
        const subpath = path.slice('/api/learn'.length) || '';
        return handleProgress(request, env, subpath);
      }

      if (path.startsWith('/api/learn')) {
        const subpath = path.slice('/api/learn'.length) || '';
        return handleLearn(request, env, subpath);
      }

      // Media serving (public)
      if (path.startsWith('/api/media/')) {
        const key = path.slice('/api/media/'.length);
        return handleMediaServe(request, env, key);
      }

      // CMS SPA — serve from /cms/ prefix
      if (path.startsWith('/cms')) {
        const assetPath = path === '/cms' ? '/cms/index.html' : path;
        const assetUrl = new URL(assetPath, request.url);
        const response = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (response.status === 404) {
          return env.ASSETS.fetch(new Request(new URL('/cms/index.html', request.url), request));
        }
        return response;
      }

      // Learn SPA — serve from root
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !path.includes('.')) {
        return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      return json({ error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
