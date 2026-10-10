/**
 * Convix usa un único modo claro y un único color de acento fijo (violeta,
 * `--primary` en globals.css), igual que el resto del ecosistema H&M Business.
 * No hay selector de apariencia: el color no es configurable por el usuario.
 */
export const MODES = ["light"] as const;

export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = "light";
