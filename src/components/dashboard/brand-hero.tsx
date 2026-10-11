import { ConvixLogo } from '@/components/ui/convix-logo';
import { AuthBrandArt } from '@/components/auth/auth-brand-art';

// Banner de marca del dashboard — misma identidad visual que el panel de
// login (superficie `auth-panel-*`, constelación de contactos, acento
// violeta), en versión baja. Mantiene el título/subtítulo reales de la página
// y deja claro que Convix es parte del ecosistema H&M Business.
export function BrandHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="border-auth-panel-border bg-auth-panel relative overflow-hidden rounded-2xl border px-6 py-6 sm:px-8 sm:py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(ellipse 70% 100% at 80% 50%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 100% at 80% 50%, black 30%, transparent 100%)',
        }}
      />
      <div aria-hidden="true" className="hidden md:block">
        <AuthBrandArt compact />
      </div>
      <div
        aria-hidden="true"
        className="from-auth-panel via-auth-panel/85 pointer-events-none absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r to-transparent"
      />

      <div className="relative max-w-xl">
        <div className="text-primary mb-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase">
          <ConvixLogo className="h-5 w-5" />
          Contactos &middot; Conversaciones &middot; Marketing
        </div>
        <h1 className="text-auth-panel-foreground text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-auth-panel-muted mt-1.5 text-sm">{subtitle}</p>
        <p className="text-auth-panel-muted mt-4 flex items-center gap-2 font-mono text-[11px]">
          <span className="border-primary/40 bg-primary/15 text-primary flex h-5 w-5 items-center justify-center rounded-md border text-[9px] font-bold">
            H&amp;M
          </span>
          Parte del ecosistema{' '}
          <span className="text-auth-panel-foreground/80 font-medium">
            H&amp;M Business
          </span>
        </p>
      </div>
    </section>
  );
}
