import { PasswordForm } from './password-form';
import { SessionsCard } from './sessions-card';
import { SettingsPanelHead } from './settings-panel-head';

/**
 * Sección «Inicio de sesión y seguridad»: contraseña y sesiones activas.
 */
export function SecurityPanel() {
  return (
    <section className="animate-in fade-in-50 w-full duration-200">
      <SettingsPanelHead
        title="Inicio de sesión y seguridad"
        description="Cambia tu contraseña y controla en qué dispositivos tienes la sesión abierta."
      />
      <div className="space-y-4">
        <PasswordForm />
        <SessionsCard />
      </div>
    </section>
  );
}
