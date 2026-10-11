import { describe, expect, it } from 'vitest';
import { NextRequest } from './shim/next-server';
import { apiSessionGuard } from './guards';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const BASE = 'https://crm.example.com';

function makeRequest(path: string, withCookie: boolean): NextRequest {
  const request = new NextRequest(new URL(path, BASE));
  if (withCookie) {
    request.cookies.set(SESSION_COOKIE, 'opaque-session-token');
  }
  return request;
}

describe('apiSessionGuard — chequeo optimista por cookie de sesión', () => {
  it('corta /api/whatsapp/* con 401 sin cookie', () => {
    const response = apiSessionGuard(makeRequest('/api/whatsapp/send', false));
    expect(response?.status).toBe(401);
  });

  it('deja pasar /api/whatsapp/* con cookie (la valida el handler)', () => {
    expect(apiSessionGuard(makeRequest('/api/whatsapp/send', true))).toBeNull();
  });

  it('deja pasar el webhook de WhatsApp sin cookie (lo llama Meta)', () => {
    expect(
      apiSessionGuard(makeRequest('/api/whatsapp/webhook', false))
    ).toBeNull();
  });

  it('no toca otras rutas de la API', () => {
    expect(apiSessionGuard(makeRequest('/api/db', false))).toBeNull();
  });
});
