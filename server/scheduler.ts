import { randomBytes } from 'node:crypto';

/**
 * Planificador interno: dispara los endpoints de cron del propio servidor.
 *
 * - /api/automations/cron  → ejecuta pasos con espera ("esperar X") vencidos.
 * - /api/flows/cron        → marca como `timed_out` los flujos abandonados
 *                            (si no, el contacto queda bloqueado para siempre
 *                            por el índice de una sola ejecución activa).
 *
 * Sin scheduler externo (Vercel Cron, pinger…) estas tareas nunca correrían.
 * Si AUTOMATION_CRON_SECRET no está definido se genera uno efímero solo para
 * este proceso. Con varias réplicas cada una dispara su propio barrido; las
 * rutas ya son idempotentes. DISABLE_INTERNAL_CRON=true lo apaga.
 */
const JOBS = [
  { path: '/api/automations/cron', everyMs: 60_000 },
  { path: '/api/flows/cron', everyMs: 5 * 60_000 },
];

export function startScheduler(port: number): void {
  if (process.env.DISABLE_INTERNAL_CRON === 'true') return;
  process.env.AUTOMATION_CRON_SECRET ||= randomBytes(32).toString('hex');
  const secret = process.env.AUTOMATION_CRON_SECRET;

  for (const job of JOBS) {
    const run = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}${job.path}`, {
          headers: { 'x-cron-secret': secret },
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) console.warn(`[cron] ${job.path} → ${res.status}`);
      } catch (err) {
        console.warn(`[cron] ${job.path} falló:`, (err as Error).message);
      }
    };
    setTimeout(run, 15_000).unref();
    setInterval(run, job.everyMs).unref();
  }
}
