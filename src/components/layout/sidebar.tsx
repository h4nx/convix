import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ConvixLogo } from '@/components/ui/convix-logo';
import { useTotalUnread } from '@/hooks/use-total-unread';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';
import {
  Bell,
  Bot,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Radio,
  Settings,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/inbox', label: 'Bandeja', icon: MessageSquare },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/contacts', label: 'Contactos', icon: Users },
  { href: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { href: '/broadcasts', label: 'Difusiones', icon: Radio },
  { href: '/automations', label: 'Automatizaciones', icon: Zap },
  { href: '/flows', label: 'Flujos', icon: Workflow },
  { href: '/agents', label: 'Agentes de IA', icon: Bot },
];

const bottomNavItems = [
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

interface SidebarProps {
  /** Controlled on mobile by the Header's hamburger button. Ignored on lg+. */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const totalUnread = useTotalUnread();
  const unreadNotifications = useUnreadNotifications();
  // Close the drawer when route changes — users opened it to navigate,
  // so once they pick a destination the drawer should get out of the way.
  useEffect(() => {
    onClose?.();
    // Only pathname drives this — onClose identity doesn't need to re-run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll and allow Escape to close while the drawer is open on
  // mobile. No-ops on desktop because the sidebar isn't positioned there.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — only exists on mobile and only when open. Clicking
          it closes the drawer. Hidden from lg+ since the sidebar is
          part of the main flex row there. */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={cn(
          'bg-background/70 fixed inset-0 z-30 backdrop-blur-sm transition-opacity lg:hidden',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          // Mobile: fixed drawer that slides in from the left.
          'border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-40 flex h-full w-[260px] flex-col border-r',
          'transition-transform duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static, always visible — reset all the mobile framing.
          'lg:static lg:z-0 lg:w-[260px] lg:translate-x-0 lg:transition-none'
        )}
        aria-label="Principal"
      >
        {/* Logo row. On mobile we put a close button here; on desktop the
            close button is hidden since the sidebar is always-visible. */}
        <div className="border-sidebar-border flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <ConvixLogo className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <span className="text-sidebar-foreground block text-sm font-semibold">
                Convix
              </span>
              <span className="text-primary-hover block font-mono text-[9px] tracking-[0.14em] uppercase">
                H&amp;M Business
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-9 w-9 items-center justify-center rounded-md lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              // Same suppress-while-active rule as before: no badge while
              // the user is already looking at the Inbox — the per-
              // conversation unread state is visible right there.
              const showUnreadBadge =
                item.href === '/inbox' && totalUnread > 0 && !isActive;

              // Unlike the inbox dot, the notifications count stays visible
              // even while the page is active — it reflects unread state
              // (cleared by marking notifications read), not "currently
              // viewing this section".
              const showNotificationBadge =
                item.href === '/notifications' && unreadNotifications > 0;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      // Taller on mobile so fingers can hit the row reliably (≥44px).
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:py-2',
                      isActive
                        ? 'bg-primary/20 text-sidebar-foreground shadow-[inset_2px_0_0_var(--primary)]'
                        : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {showUnreadBadge && (
                      <span
                        aria-label={`${totalUnread} ${totalUnread === 1 ? 'conversación sin leer' : 'conversaciones sin leer'}`}
                        className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                      >
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                    {showNotificationBadge && (
                      <span
                        aria-label={`${unreadNotifications} ${unreadNotifications === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}`}
                        className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-sidebar-border my-4 border-t" />

          <ul className="flex flex-col gap-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:py-2',
                      isActive
                        ? 'bg-primary/20 text-sidebar-foreground shadow-[inset_2px_0_0_var(--primary)]'
                        : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="border-sidebar-border text-sidebar-foreground/50 shrink-0 border-t px-4 py-3 text-center text-[11px] leading-relaxed">
          © {new Date().getFullYear()}{' '}
          <a
            href="https://hmbusiness.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sidebar-foreground"
          >
            H&amp;M Business
          </a>
          <br />
          Todos los derechos reservados
        </p>
      </aside>
    </>
  );
}
