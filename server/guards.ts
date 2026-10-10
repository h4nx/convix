import { SESSION_COOKIE } from '@/lib/auth/constants';
import { NextResponse, type NextRequest } from './shim/next-server';

/**
 * Chequeo OPTIMISTA por presencia de cookie para la API de WhatsApp (no el webhook): corta
 * temprano sin cookie. Los handlers igual validan la sesión — esto solo ahorra trabajo.
 * (Las redirecciones de páginas login/dashboard ahora viven en el cliente: src/components/route-guards.tsx.)
 */
export function apiSessionGuard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (
    !request.cookies.has(SESSION_COOKIE) &&
    pathname.startsWith('/api/whatsapp/') &&
    !pathname.includes('/webhook')
  ) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  return null;
}
