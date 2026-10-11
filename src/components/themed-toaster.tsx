import { Toaster } from 'sonner';

import { DEFAULT_MODE } from '@/lib/themes';

/** Toaster de sonner con los mismos tokens CSS que el resto de la app (modo claro fijo). */
export function ThemedToaster() {
  return (
    <Toaster
      theme={DEFAULT_MODE}
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          color: 'var(--popover-foreground)',
        },
      }}
    />
  );
}
