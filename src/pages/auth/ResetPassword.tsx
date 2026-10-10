import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";

// `useSearchParams` fuerza Suspense — mismo patrón que /login.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(json.error ?? "Algo salió mal");
      setLoading(false);
      return;
    }

    // El endpoint deja la sesión iniciada.
    navigate("/dashboard");
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="mb-8">
          <p className="mb-2 font-mono text-xs tracking-[0.14em] text-primary uppercase">
            Convix &middot; Restablecer contraseña
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-auth-form-foreground">
            Enlace de restablecimiento no válido
          </h2>
          <p className="mt-1.5 text-sm text-auth-form-muted">
            A este enlace le falta el token. Solicita uno nuevo desde la página de recuperación de contraseña.
          </p>
        </div>
        <Link to="/forgot-password">
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-auth-form-border text-auth-form-foreground hover:bg-auth-form-input"
          >
            Solicitar un enlace nuevo
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-[0.14em] text-primary uppercase">
          Convix &middot; Restablecer contraseña
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-auth-form-foreground">
          Elige una nueva contraseña
        </h2>
        <p className="mt-1.5 text-sm text-auth-form-muted">
          El enlace es válido por una hora y se puede usar una sola vez.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-auth-form-muted">
            Nueva contraseña
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-xl border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className="text-auth-form-muted">
            Confirmar contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 rounded-xl border-auth-form-border bg-auth-form-input text-auth-form-foreground placeholder:text-auth-form-muted focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Definir contraseña nueva"}
        </Button>
      </form>
    </AuthLayout>
  );
}
