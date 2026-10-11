#!/usr/bin/env node
/**
 * Genera server/routes.generated.ts: una tabla estática con todos los route handlers de
 * server/routes/**\/route.ts (misma convención de carpetas que App Router: [id], [...path]).
 * Estática para que esbuild pueda empaquetar el servidor sin imports dinámicos.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const routesDir = join(root, 'server', 'routes');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name === 'route.ts' ? [full] : [];
  });
}

function toPattern(file) {
  const segments = relative(routesDir, file).split(sep).slice(0, -1);
  return (
    '/api/' +
    segments
      .map((s) => {
        const catchAll = s.match(/^\[\.\.\.(\w+)\]$/);
        if (catchAll) return `:${catchAll[1]}{.+}`;
        const dyn = s.match(/^\[(\w+)\]$/);
        return dyn ? `:${dyn[1]}` : s;
      })
      .join('/')
  ).replace(/\/$/, '');
}

// Más específicas primero: literal < dinámico < catch-all, segmento a segmento.
const rank = (s) => (s.includes('{.+}') ? 2 : s.startsWith(':') ? 1 : 0);
function compare(a, b) {
  const sa = a.pattern.split('/');
  const sb = b.pattern.split('/');
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    if (sa[i] === undefined) return -1;
    if (sb[i] === undefined) return 1;
    const d = rank(sa[i]) - rank(sb[i]);
    if (d !== 0) return d;
  }
  return a.pattern.localeCompare(b.pattern);
}

const routes = walk(routesDir)
  .map((file) => ({ file, pattern: toPattern(file) }))
  .sort(compare);

const lines = [
  '// GENERADO por scripts/gen-routes.mjs — no editar a mano.',
  "import type { RouteModule } from './route-types';",
  ...routes.map(
    (r, i) =>
      `import * as r${i} from './routes/${relative(routesDir, r.file).split(sep).join('/').replace(/\.ts$/, '')}';`
  ),
  '',
  'export const routes: { pattern: string; module: RouteModule }[] = [',
  ...routes.map(
    (r, i) =>
      `  { pattern: '${r.pattern}', module: r${i} as unknown as RouteModule },`
  ),
  '];',
  '',
];
writeFileSync(join(root, 'server', 'routes.generated.ts'), lines.join('\n'));
console.log(`routes.generated.ts: ${routes.length} rutas`);
