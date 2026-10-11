import { cookies } from '@server/shim/next-headers';
import { NextResponse, type NextRequest } from '@server/shim/next-server';
import {
  deleteOtherSessions,
  deleteSessionById,
  getSessionUser,
  listSessions,
  SESSION_COOKIE,
} from '@/lib/auth/session';

async function currentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return { token, user: await getSessionUser(token) };
}

/** Lista las sesiones activas del usuario (la actual marcada con `current`). */
export async function GET() {
  const { token, user } = await currentUser();
  if (!user)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json({ sessions: await listSessions(user.id, token) });
}

/**
 * Revoca sesiones: `{ id }` una concreta, `{ others: true }` todas menos la
 * actual. Cerrar la sesión actual o todas va por /api/auth/logout.
 */
export async function DELETE(request: NextRequest) {
  const { token, user } = await currentUser();
  if (!user)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    others?: boolean;
  } | null;

  if (body?.others) {
    const revoked = await deleteOtherSessions(user.id, token);
    return NextResponse.json({ revoked });
  }
  if (typeof body?.id === 'string') {
    const sessions = await listSessions(user.id, token);
    if (sessions.find((s) => s.id === body.id)?.current) {
      return NextResponse.json(
        { error: 'Usa cerrar sesión para terminar la sesión actual' },
        { status: 400 }
      );
    }
    const ok = await deleteSessionById(user.id, body.id);
    return NextResponse.json(
      { revoked: ok ? 1 : 0 },
      { status: ok ? 200 : 404 }
    );
  }
  return NextResponse.json({ error: 'Cuerpo no válido' }, { status: 400 });
}
