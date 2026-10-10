import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const MIN_PASSWORD = 8;

// Puntaje simple 0–4: longitud, mayúsculas/minúsculas, números y símbolos.
function strength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][score] };
}

const BAR_COLORS = ['bg-destructive', 'bg-destructive', 'bg-amber-500', 'bg-primary', 'bg-emerald-500'];

export function PasswordForm() {
  const supabase = createClient();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const s = strength(next);
  const inputType = show ? 'text' : 'password';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD) {
      setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
      return;
    }
    if (next !== confirm) {
      setFormError('La nueva contraseña y su confirmación no coinciden');
      return;
    }
    if (next === current) {
      setFormError('La nueva contraseña debe ser distinta de la actual');
      return;
    }
    setFormError(null);
    setSaving(true);

    try {
      // El servidor verifica la contraseña actual, guarda la nueva y cierra
      // el resto de sesiones (esta se mantiene abierta).
      const { error } = await supabase.auth.updateUser({
        password: next,
        current_password: current,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success('Contraseña actualizada', {
        description: 'Se cerró la sesión en tus otros dispositivos.',
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <KeyRound className="size-4 text-primary" />
          Contraseña
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Usa al menos {MIN_PASSWORD} caracteres. Seguirás con la sesión abierta
          en este dispositivo; en los demás se cerrará.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-foreground">
              Contraseña actual
            </Label>
            <Input
              id="current-password"
              type={inputType}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              disabled={saving}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">
                Nueva contraseña
              </Label>
              <Input
                id="new-password"
                type={inputType}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                disabled={saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirm-password"
                type={inputType}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                disabled={saving}
                required
              />
            </div>
          </div>

          {next && (
            <div aria-live="polite">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < s.score ? BAR_COLORS[s.score] : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Seguridad: {s.label}
              </p>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {show ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            </button>
            <Button
              type="submit"
              disabled={saving || !current || !next || !confirm}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Actualizando…
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
