import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ROLE_META } from '@/components/settings/role-meta';
import { LogOut, Menu, Settings as SettingsIcon, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Panel',
  '/inbox': 'Bandeja',
  '/notifications': 'Notificaciones',
  '/contacts': 'Contactos',
  '/pipelines': 'Pipelines',
  '/broadcasts': 'Difusiones',
  '/automations': 'Automatizaciones',
  '/flows': 'Flujos',
  '/agents': 'Agentes de IA',
  '/settings': 'Ajustes',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const match = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  );
  return match ? match[1] : 'Panel';
}

interface HeaderProps {
  /** Wired to the shell's drawer state. Used only on mobile — the
   *  hamburger button is hidden on lg+. */
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { pathname } = useLocation();
  const { profile, signOut, accountRole } = useAuth();
  const title = getPageTitle(pathname);

  const initial =
    profile?.full_name?.charAt(0)?.toUpperCase() ??
    profile?.email?.charAt(0)?.toUpperCase() ??
    'U';

  return (
    <header className="border-border bg-background flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {/* Hamburger — mobile only. 44×44 hit target per Apple HIG. */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menú"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-md transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-foreground truncate text-base font-semibold sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hover:bg-muted/70 focus:bg-muted/70 data-popup-open:bg-muted/70 flex items-center gap-2 rounded-md px-1 py-1 transition-colors focus:outline-none sm:gap-3 sm:pr-3 sm:pl-1"
            aria-label="Abrir menú de la cuenta"
          >
            <Avatar className="size-8">
              {profile?.avatar_url ? (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.full_name ?? 'Foto'}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
              <span className="text-foreground truncate text-sm font-medium">
                {profile?.full_name ?? 'Usuario'}
              </span>
              {accountRole ? (
                <span className="text-muted-foreground truncate text-xs">
                  {ROLE_META[accountRole].label}
                </span>
              ) : null}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="bg-popover text-popover-foreground ring-border min-w-56"
          >
            <div className="px-2 py-1.5">
              <p className="text-foreground truncate text-sm font-medium">
                {profile?.full_name ?? 'Usuario'}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {profile?.email ?? ''}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              render={
                <Link
                  to="/settings?tab=profile"
                  className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                />
              }
            >
              <User className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <Link
                  to="/settings?tab=whatsapp"
                  className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                />
              }
            >
              <SettingsIcon className="size-4" />
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={signOut}
              className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
