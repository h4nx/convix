import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="mb-8">
          <p className="text-primary mb-2 font-mono text-xs tracking-[0.14em] uppercase">
            Convix &middot; Restablecer contraseña
          </p>
          <h2 className="text-auth-form-foreground text-2xl font-semibold tracking-tight">
            Revisa tu correo
          </h2>
          <p className="text-auth-form-muted mt-1.5 text-sm">
            Enviamos un enlace para restablecer la contraseña a{' '}
            <span className="text-auth-form-foreground">{email}</span>. Revisa
            tu bandeja de entrada.
          </p>
        </div>
        <Link to="/login">
          <Button
            variant="outline"
            className="border-auth-form-border text-auth-form-muted hover:bg-auth-form-input hover:text-auth-form-foreground h-11 w-full rounded-xl"
          >
            Volver a iniciar sesión
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-primary mb-2 font-mono text-xs tracking-[0.14em] uppercase">
          Convix &middot; Restablecer contraseña
        </p>
        <h2 className="text-auth-form-foreground text-2xl font-semibold tracking-tight">
          Restablecer contraseña
        </h2>
        <p className="text-auth-form-muted mt-1.5 text-sm">
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-auth-form-muted">
            Correo
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-11 w-full rounded-xl disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
        </Button>
      </form>

      <Link
        to="/login"
        className="text-auth-form-muted hover:text-auth-form-foreground mt-6 flex items-center justify-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
