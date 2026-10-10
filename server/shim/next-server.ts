/**
 * Reemplazo mínimo de `next/server` para los route handlers de Convix: NextRequest/NextResponse
 * sobre las clases Request/Response estándar (Node 24), más `after()`.
 */
import { RequestCookies, serializeCookie, type CookieOptions } from './cookies';

export class NextRequest extends Request {
  readonly nextUrl: URL & { clone(): URL };
  readonly cookies: RequestCookies;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    Object.defineProperty(url, 'clone', { value: () => new URL(url.toString()) });
    this.nextUrl = url as URL & { clone(): URL };
    this.cookies = new RequestCookies(this.headers.get('cookie'));
  }
}

class ResponseCookies {
  constructor(private readonly headers: Headers) {}

  set(name: string, value: string, options?: CookieOptions): this {
    this.headers.append('set-cookie', serializeCookie(name, value, options));
    return this;
  }

  delete(name: string): this {
    this.headers.append('set-cookie', serializeCookie(name, '', { maxAge: 0 }));
    return this;
  }
}

export class NextResponse<Body = unknown> extends Response {
  readonly cookies: ResponseCookies;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this.cookies = new ResponseCookies(this.headers);
  }

  static json<T>(data: T, init?: ResponseInit): NextResponse<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    return new NextResponse<T>(JSON.stringify(data), { ...init, headers });
  }

  static redirect(url: string | URL, init?: number | ResponseInit): NextResponse {
    const status = typeof init === 'number' ? init : (init?.status ?? 307);
    const headers = new Headers(typeof init === 'object' ? init.headers : undefined);
    headers.set('location', String(url));
    return new NextResponse(null, { status, headers });
  }

  static next(init?: ResponseInit): NextResponse {
    const headers = new Headers(init?.headers);
    headers.set('x-middleware-next', '1');
    return new NextResponse(null, { ...init, headers });
  }
}

/** Ejecuta trabajo después de responder. En un proceso Node de larga vida basta con diferirlo. */
export function after(task: (() => unknown | Promise<unknown>) | Promise<unknown>): void {
  void Promise.resolve()
    .then(() => (typeof task === 'function' ? task() : task))
    .catch((err) => console.error('[after] la tarea falló', err));
}
