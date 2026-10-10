import { Hono, type Context } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { apiSessionGuard } from './guards';
import type { RouteHandler } from './route-types';
import { routes } from './routes.generated';
import { SECURITY_HEADERS } from './security-headers';
import { requestContext } from './shim/request-context';
import { NextRequest } from './shim/next-server';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;

/** Ejecuta un route handler estilo App Router con contexto de petición (cookies()/headers()). */
async function run(handler: RouteHandler, pattern: string, c: Context): Promise<Response> {
  // @hono/node-server entrega un Request "ligero" (sin internals nativos): no se puede pasar tal cual
  // a super(); se reconstruye con sus getters públicos.
  const raw = c.req.raw;
  const hasBody = raw.method !== 'GET' && raw.method !== 'HEAD';
  const request = new NextRequest(raw.url, {
    method: raw.method,
    headers: raw.headers,
    body: hasBody ? raw.body : undefined,
    signal: raw.signal,
    // Node exige duplex al enviar un stream como cuerpo (no está en los tipos DOM).
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit);
  const blocked = apiSessionGuard(request);
  if (blocked) return blocked;

  // [...path] llega como array de segmentos en Next; Hono entrega la cadena "a/b/c".
  const params: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(c.req.param())) {
    params[key] = pattern.includes(`:${key}{.+}`) ? value.split('/') : value;
  }

  const ctx = { request, setCookies: [] as string[] };
  const response = await requestContext.run(ctx, () => handler(request, { params: Promise.resolve(params) }));
  if (ctx.setCookies.length === 0) return response;

  const headers = new Headers(response.headers);
  for (const cookie of ctx.setCookies) headers.append('set-cookie', cookie);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function createApp(options: { staticDir?: string } = {}) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    await next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) c.header(key, value);
    // Respuestas de la API: por usuario, nunca compartibles en el edge (salvo que el handler fije su propia política).
    if (c.req.path.startsWith('/api/') && !c.res.headers.has('Cache-Control')) c.header('Cache-Control', 'no-store');
  });

  for (const { pattern, module } of routes) {
    for (const method of METHODS) {
      const handler = module[method];
      if (handler) app.on(method, pattern, (c) => run(handler, pattern, c));
    }
  }

  app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404));

  // Frontend (Vite build): estáticos con caché larga para /assets, y fallback SPA a index.html.
  const staticDir = options.staticDir;
  if (staticDir && existsSync(join(staticDir, 'index.html'))) {
    const indexHtml = readFileSync(join(staticDir, 'index.html'), 'utf8');
    app.use('/assets/*', async (c, next) => {
      await next();
      if (c.res.status === 200) c.header('Cache-Control', 'public, max-age=31536000, immutable');
    });
    app.use('*', serveStatic({ root: staticDir }));
    app.get('*', (c) => {
      // Un asset inexistente es un 404 real (no el index.html con caché inmutable).
      if (c.req.path.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(c.req.path)) return c.notFound();
      c.header('Cache-Control', 'no-cache');
      return c.html(indexHtml);
    });
  }

  return app;
}
