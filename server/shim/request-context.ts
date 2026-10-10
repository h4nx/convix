import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Contexto por petición para emular `cookies()` / `headers()` de Next.js
 * dentro de los route handlers que ahora corren en el servidor Node propio.
 */
export interface RequestContext {
  request: Request;
  /** Cabeceras Set-Cookie acumuladas por cookies().set()/delete(); se añaden a la respuesta. */
  setCookies: string[];
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  const ctx = requestContext.getStore();
  if (!ctx) {
    throw new Error('cookies()/headers() solo pueden usarse dentro de un route handler');
  }
  return ctx;
}
