export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date | number;
}

export function parseCookieHeader(header: string | null): Map<string, string> {
  const jar = new Map<string, string>();
  if (!header) return jar;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      jar.set(name, decodeURIComponent(value));
    } catch {
      jar.set(name, value);
    }
  }
  return jar;
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.expires !== undefined) parts.push(`Expires=${new Date(options.expires).toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) {
    const s = options.sameSite === true ? 'strict' : options.sameSite;
    parts.push(`SameSite=${s.charAt(0).toUpperCase()}${s.slice(1)}`);
  }
  return parts.join('; ');
}

export interface CookieEntry {
  name: string;
  value: string;
}

/** Subconjunto de RequestCookies de Next.js (lo que usa el código de Convix). */
export class RequestCookies {
  private readonly jar: Map<string, string>;

  constructor(header: string | null) {
    this.jar = parseCookieHeader(header);
  }

  get(name: string): CookieEntry | undefined {
    const value = this.jar.get(name);
    return value === undefined ? undefined : { name, value };
  }

  getAll(): CookieEntry[] {
    return [...this.jar].map(([name, value]) => ({ name, value }));
  }

  has(name: string): boolean {
    return this.jar.has(name);
  }

  set(name: string, value: string): this {
    this.jar.set(name, value);
    return this;
  }

  delete(name: string): boolean {
    return this.jar.delete(name);
  }
}
