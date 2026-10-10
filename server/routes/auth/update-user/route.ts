import { cookies } from '@server/shim/next-headers';
import { NextResponse, type NextRequest } from '@server/shim/next-server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth/session';
import { deleteOtherSessions } from '@/lib/auth/session';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import {
  verifyCredentials,
  findUserByEmail,
  getUserById,
  updateEmail,
  updatePassword,
  updateUserMetadata,
} from '@/lib/auth/users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    current_password?: string;
    data?: Record<string, unknown>;
  } | null;
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo no válido' }, { status: 400 });
  }

  // Cambiar contraseña o correo exige la contraseña actual (cuando la cuenta
  // tiene una; las cuentas creadas solo por SSO no la tienen).
  if (body.password !== undefined || body.email !== undefined) {
    const sensitiveChange =
      body.password !== undefined ||
      (body.email !== undefined &&
        String(body.email).trim().toLowerCase() !== user.email.toLowerCase());
    if (sensitiveChange) {
      const record = await findUserByEmail(user.email);
      if (record?.password_hash) {
        const limit = checkRateLimit(`auth-update:${user.id}`, {
          limit: 10,
          windowMs: 15 * 60_000,
        });
        if (!limit.success) return rateLimitResponse(limit);
        const ok = body.current_password
          ? await verifyCredentials(user.email, body.current_password)
          : null;
        if (!ok) {
          return NextResponse.json(
            { error: 'La contraseña actual es incorrecta' },
            { status: 403 }
          );
        }
      }
    }
  }

  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }
    await updatePassword(user.id, body.password);
    // Una contraseña nueva invalida el resto de sesiones (queda solo esta).
    await deleteOtherSessions(user.id, token);
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Correo no válido' },
        { status: 400 }
      );
    }
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: 'El correo ya está en uso' },
        { status: 422 }
      );
    }
    await updateEmail(user.id, email);
  }

  if (body.data && typeof body.data === 'object') {
    await updateUserMetadata(user.id, body.data);
  }

  return NextResponse.json({ user: await getUserById(user.id) });
}
