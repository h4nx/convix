import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';

// `useSearchParams` opts the component out of static prerendering
// unless it sits under a Suspense boundary. We split the form into
// a child component so the outer page can prerender the chrome
// (background, card frame) while the form hydrates with the query
// string on the client.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [searchParams] = useSearchParams();
  // Forwarded from `/join/<token>` when the visitor already has an
  // account. After a successful sign-in we send them to the join
  // page to accept rather than to /dashboard.
  const inviteToken = searchParams.get('invite');
  const t = useTranslations('LoginPage');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    // El callback OIDC redirige con ?error=sso cuando el intercambio falla.
    searchParams.get('error') === 'sso' ? t('ssoError') : null
  );
  const [loading, setLoading] = useState(false);
  const [ssoProvider, setSsoProvider] = useState<string | null>(null);
  const navigate = useNavigate();
  const supabase = createClient();

  useEffect(() => {
    // Muestra el botón de SSO solo si el servidor tiene OIDC configurado
    // (Vaultex/Keycloak en el ecosistema H&M, o cualquier proveedor OIDC).
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((p: { oidc: { name: string } | null }) => {
        if (p.oidc) setSsoProvider(p.oidc.name);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (inviteToken) {
      navigate(`/join/${encodeURIComponent(inviteToken)}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-primary mb-2 font-mono text-xs tracking-[0.14em] uppercase">
          Convix &middot; {t('signIn')}
        </p>
        <h2 className="text-auth-form-foreground text-2xl font-semibold tracking-tight">
          {inviteToken ? t('titleAccept') : t('titleWelcome')}
        </h2>
        <p className="text-auth-form-muted mt-1.5 text-sm">
          {inviteToken ? t('descAccept') : t('descWelcome')}
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-auth-form-muted">
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-auth-form-muted">
              {t('passwordLabel')}
            </Label>
            <Link
              to="/forgot-password"
              className="text-primary hover:text-primary/80 text-sm"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-11 w-full rounded-xl disabled:opacity-50"
        >
          {loading ? t('signingIn') : t('signIn')}
        </Button>
      </form>

      {ssoProvider && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-auth-form-border h-px flex-1" />
            <span className="text-auth-form-muted text-xs">{t('ssoOr')}</span>
            <div className="bg-auth-form-border h-px flex-1" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-auth-form-border bg-auth-form text-auth-form-foreground hover:bg-auth-form-input hover:text-auth-form-foreground h-11 w-full rounded-xl"
            onClick={() => {
              window.location.href = '/api/auth/oidc/login';
            }}
          >
            {t('ssoContinue', { provider: ssoProvider })}
          </Button>
        </div>
      )}

      <p className="text-auth-form-muted mt-6 text-center text-sm">
        {t('noAccount')}{' '}
        <Link
          to={
            inviteToken
              ? `/signup?invite=${encodeURIComponent(inviteToken)}`
              : '/signup'
          }
          className="text-primary hover:text-primary/80"
        >
          {t('createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
