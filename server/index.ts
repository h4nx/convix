import { serve } from '@hono/node-server';
import { resolve } from 'node:path';
import { createApp } from './app';
import { startScheduler } from './scheduler';

// Compatibilidad: el nombre anterior de la variable (cuando la app corría en Next.js).
process.env.SITE_URL ??= process.env.NEXT_PUBLIC_SITE_URL;

const port = Number(process.env.PORT ?? 3000);
const staticDir = process.env.STATIC_DIR ?? resolve(process.cwd(), 'dist');

const app = createApp({ staticDir });

serve({ fetch: app.fetch, port, hostname: process.env.HOSTNAME ?? '0.0.0.0' }, (info) => {
  console.log(`Convix escuchando en http://${info.address}:${info.port}`);
  startScheduler(info.port);
});
