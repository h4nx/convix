import { useEffect, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

/**
 * Páginas de auth (login / signup / forgot-password): si ya hay sesión, al dashboard — salvo que
 * venga un invite token, que manda a /join/<token> para aceptarlo. (Antes lo hacía proxy.ts.)
 * La cookie de sesión es httpOnly, así que se consulta /api/auth/session.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { user?: unknown } | null) => {
        if (cancelled || !body?.user) return;
        const invite = new URLSearchParams(search).get('invite');
        if (invite && (pathname === '/login' || pathname === '/signup')) {
          navigate(`/join/${encodeURIComponent(invite)}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [navigate, pathname, search]);

  return <>{children}</>;
}

export function AuthPagesLayout() {
  return (
    <RedirectIfAuthenticated>
      <Outlet />
    </RedirectIfAuthenticated>
  );
}

/**
 * /join/:token — híbrido: debe verse para visitantes anónimos ("regístrate para unirte") y para
 * usuarios con sesión ("aceptar invitación"). Referrer-Policy no-referrer: el token en claro viaja
 * en la ruta y no debe filtrarse por Referer a recursos externos.
 */
export function JoinLayout() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Outlet />
    </div>
  );
}
