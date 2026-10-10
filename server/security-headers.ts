/**
 * Cabeceras de seguridad base aplicadas a cada respuesta.
 *
 * CSP va como `Content-Security-Policy-Report-Only`: el navegador reporta violaciones en consola
 * sin bloquear nada; cuando haya confianza, cambiar la clave a `Content-Security-Policy`.
 * El resto son bloqueos seguros hoy:
 *   - HSTS: solo tiene sentido en HTTPS (no-op en http://localhost).
 *   - X-Content-Type-Options / X-Frame-Options / Referrer-Policy: hardening OWASP base.
 *   - Permissions-Policy: no usamos cámara/geolocalización/etc. El micrófono se permite en
 *     same-origin para grabar notas de voz con MediaRecorder en el composer del inbox.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    // El script inline de arranque del tema (index.html) requiere 'unsafe-inline'.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Tailwind + atributos style inline en muchos componentes.
    "style-src 'self' 'unsafe-inline'",
    // Avatares de contactos (URLs https arbitrarias), OG images y data URLs.
    "img-src 'self' data: blob: https:",
    // Previews de media saliente (blob: de MediaRecorder); el media del inbox sale de /api/storage.
    "media-src 'self' blob:",
    "font-src 'self' data:",
    // Datos y realtime (SSE) van al propio origen (/api/db, /api/realtime).
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};
