import type { ReactNode } from "react";
import { AuthBrandPanel } from "./auth-brand-panel";
import { ConvixLogo } from "@/components/ui/convix-logo";

// Shared chrome for every unauthenticated page (login, signup,
// forgot-password, reset-password): a persistent dark brand panel
// (AuthBrandPanel — identical on all four pages) beside a light form
// panel that only renders whatever step-specific content each page
// passes in. Individual pages keep their own state/handlers/validation
// entirely — this component only owns layout and the two panels'
// fixed surface colors.
//
// Below `lg` the brand panel hides (see AuthBrandPanel) and the form
// panel takes the full viewport width.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />
      <div className="flex min-w-0 flex-1 items-center justify-center bg-auth-form px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Marca compacta: el panel grande se oculta bajo `lg`. */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <ConvixLogo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-auth-form-foreground">
              Convix
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-auth-form-muted uppercase">
              · H&amp;M Business
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
