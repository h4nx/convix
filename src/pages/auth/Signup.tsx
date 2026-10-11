import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';

// `useSearchParams` opts the component out of static prerendering
// unless wrapped in Suspense — same pattern as /login.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // When the user lands here from `/join/<token>` we carry the
  // invite token in the query. Signup now signs the user in
  // directly (auth propia, sin verificación por email), so on
  // success we route straight to the redeem step or the dashboard.
  const inviteToken = searchParams.get('invite');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // La cuenta queda creada y la sesión iniciada en el mismo paso.
    setSuccess(true);
    if (inviteToken) {
      navigate(`/join/${encodeURIComponent(inviteToken)}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="mb-8">
          <p className="text-primary mb-2 font-mono text-xs tracking-[0.14em] uppercase">
            Convix &middot; Registro
          </p>
          <h2 className="text-auth-form-foreground text-2xl font-semibold tracking-tight">
            Cuenta creada
          </h2>
          <p className="text-auth-form-muted mt-1.5 text-sm">
            Iniciaste sesión como{' '}
            <span className="text-auth-form-foreground">{email}</span>. Te
            estamos llevando a tu panel…
          </p>
        </div>
        <Link
          to={
            inviteToken
              ? `/login?invite=${encodeURIComponent(inviteToken)}`
              : '/login'
          }
        >
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
          Convix &middot; Registro
        </p>
        <h2 className="text-auth-form-foreground text-2xl font-semibold tracking-tight">
          {inviteToken ? 'Crear cuenta y unirme' : 'Crear cuenta'}
        </h2>
        <p className="text-auth-form-muted mt-1.5 text-sm">
          {inviteToken
            ? 'Verifica tu correo y luego acepta la invitación para unirte a tu equipo.'
            : 'Empieza con Convix, el CRM de WhatsApp'}
        </p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName" className="text-auth-form-muted">
            Nombre completo
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Juan Pérez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

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

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-auth-form-muted">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Al menos 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className="text-auth-form-muted">
            Confirmar contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-11 w-full rounded-xl disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-auth-form-muted mt-6 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link
          to={
            inviteToken
              ? `/login?invite=${encodeURIComponent(inviteToken)}`
              : '/login'
          }
          className="text-primary hover:text-primary/80"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
