import type { Env } from './env';
import { json } from './lib/json';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // API routes
      if (path.startsWith('/api/admin/')) {
        return json({ error: 'Not implemented' }, 501);
      }

      if (path.startsWith('/api/learn/')) {
        return json({ error: 'Not implemented' }, 501);
      }

      if (path.startsWith('/api/auth/')) {
        return json({ error: 'Not implemented' }, 501);
      }

      if (path.startsWith('/api/media/')) {
        return json({ error: 'Not implemented' }, 501);
      }

      // CMS SPA — serve from /cms/ prefix
      if (path.startsWith('/cms')) {
        // Rewrite to serve CMS assets from the cms/ subdirectory
        const assetPath = path === '/cms' ? '/cms/index.html' : path;
        const assetUrl = new URL(assetPath, request.url);
        const response = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (response.status === 404) {
          // SPA fallback
          return env.ASSETS.fetch(new Request(new URL('/cms/index.html', request.url), request));
        }
        return response;
      }

      // Learn SPA — serve from root
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !path.includes('.')) {
        // SPA fallback for client-side routes
        return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      return json({ error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
