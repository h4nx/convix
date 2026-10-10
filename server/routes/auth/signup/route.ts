import { cookies } from '@server/shim/next-headers';
import { NextResponse, type NextRequest } from '@server/shim/next-server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session';
import { createUser, findUserByEmail } from '@/lib/auth/users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    data?: { full_name?: unknown };
  } | null;
  const email = body?.email?.trim();
  const password = body?.password;
  const fullName =
    typeof body?.data?.full_name === 'string' ? body.data.full_name.trim() : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Se requiere un correo válido' },
      { status: 400 }
    );
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 8 caracteres' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const limit = checkRateLimit(`auth-signup:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.success) return rateLimitResponse(limit);

  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: 'El usuario ya está registrado' },
      { status: 422 }
    );
  }

  const user = await createUser({ email, password, fullName });
  const { token } = await createSession(
    user.id,
    request.headers.get('user-agent')
  );
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
  return NextResponse.json({ user });
}
