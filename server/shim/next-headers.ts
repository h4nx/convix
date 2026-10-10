/** Reemplazo de `next/headers` para los route handlers: lee del contexto de la petición en curso. */
import { RequestCookies, serializeCookie, type CookieOptions } from './cookies';
import { getRequestContext } from './request-context';

class CookieStore extends RequestCookies {
  constructor(private readonly pending: string[], header: string | null) {
    super(header);
  }

  override set(name: string, value: string, options?: CookieOptions): this {
    super.set(name, value);
    this.pending.push(serializeCookie(name, value, options));
    return this;
  }

  override delete(name: string): boolean {
    const had = super.delete(name);
    this.pending.push(serializeCookie(name, '', { maxAge: 0 }));
    return had;
  }
}

export async function cookies(): Promise<CookieStore> {
  const ctx = getRequestContext();
  return new CookieStore(ctx.setCookies, ctx.request.headers.get('cookie'));
}

export async function headers(): Promise<Headers> {
  return new Headers(getRequestContext().request.headers);
}
