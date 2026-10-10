import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Laptop, Loader2, LogOut, Smartphone } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface SessionInfo {
  id: string;
  user_agent: string | null;
  created_at: string;
  last_used_at: string;
  current: boolean;
}

// Resumen legible del user-agent: «Chrome en macOS».
function describeAgent(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: 'Dispositivo desconocido', mobile: false };
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Navegador';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iOS/.test(ua)
        ? 'iOS'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'sistema desconocido';
  return { label: `${browser} en ${os}`, mobile: /Android|iPhone|iPad|Mobile/.test(ua) };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

export function SessionsCard() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/sessions');
      if (!res.ok) throw new Error();
      const body = (await res.json()) as { sessions: SessionInfo[] };
      setSessions(body.sessions);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = async (payload: { id: string } | { others: true }) => {
    const key = 'id' in payload ? payload.id : 'others';
    setBusyId(key);
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Sesión cerrada');
      await load();
    } catch {
      toast.error('No se pudo cerrar la sesión');
    } finally {
      setBusyId(null);
    }
  };

  const onConfirm = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        toast.error(`No se pudo cerrar la sesión: ${error.message}`);
        return;
      }
      window.location.href = '/login';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSigningOut(false);
    }
  };

  const others = sessions?.filter((s) => !s.current) ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <LogOut className="size-4 text-primary" />
            Sesiones activas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Dispositivos con la sesión abierta en tu cuenta. Cierra los que no
            reconozcas o si perdiste un equipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions === null && !loadError && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando sesiones…
            </p>
          )}
          {loadError && (
            <p className="text-sm text-destructive">
              No se pudieron cargar las sesiones.{' '}
              <button type="button" className="underline" onClick={() => void load()}>
                Reintentar
              </button>
            </p>
          )}

          {sessions && (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {sessions.map((s) => {
                const { label, mobile } = describeAgent(s.user_agent);
                const Icon = mobile ? Smartphone : Laptop;
                return (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Icon className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {label}
                        {s.current && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                            Este dispositivo
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Activa {timeAgo(s.last_used_at)} · iniciada{' '}
                        {new Date(s.created_at).toLocaleDateString('es', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    {!s.current && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busyId !== null}
                        onClick={() => void revoke({ id: s.id })}
                      >
                        {busyId === s.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          'Cerrar'
                        )}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            {others.length > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={busyId !== null}
                onClick={() => void revoke({ others: true })}
              >
                Cerrar las otras {others.length}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              <LogOut className="size-4" />
              Cerrar sesión en todos los dispositivos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión en todas partes?</DialogTitle>
            <DialogDescription>
              Se cerrará la sesión en todos los dispositivos, incluido este, y
              tendrán que iniciar sesión de nuevo. Te llevaremos a la pantalla
              de inicio de sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={signingOut}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} disabled={signingOut}>
              {signingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cerrando…
                </>
              ) : (
                'Cerrar sesión en todas partes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
