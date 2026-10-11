import { CheckCheck, Megaphone, Zap } from 'lucide-react';

// Ilustración de fondo del panel de marca: una "constelación" de contactos
// unidos por líneas (CRM), conversaciones de WhatsApp flotando encima
// (inbox compartido), ondas de difusión que salen de un megáfono
// (broadcasts/marketing) y una mini tarjeta de pipeline con automatización.
// Es decorativa (aria-hidden en el panel padre) y usa solo tokens del tema
// (`--primary`, `--auth-panel-*`) para seguir el acento de Convix.

// Nodos de la red de contactos, en un viewBox 600x640. `r` = tamaño del avatar.
const NODES = [
  { id: 'hub', x: 330, y: 330, r: 34, hub: true },
  { id: 'a', x: 120, y: 150, r: 20 },
  { id: 'b', x: 300, y: 70, r: 16 },
  { id: 'c', x: 505, y: 170, r: 22 },
  { id: 'd', x: 545, y: 400, r: 17 },
  { id: 'e', x: 440, y: 565, r: 21 },
  { id: 'f', x: 210, y: 540, r: 16 },
  { id: 'g', x: 70, y: 380, r: 19 },
  { id: 'h', x: 215, y: 300, r: 12 },
  { id: 'i', x: 450, y: 320, r: 11 },
] as const;

const LINKS: Array<[string, string]> = [
  ['hub', 'a'],
  ['hub', 'b'],
  ['hub', 'c'],
  ['hub', 'd'],
  ['hub', 'e'],
  ['hub', 'f'],
  ['hub', 'g'],
  ['hub', 'h'],
  ['hub', 'i'],
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'd'],
  ['d', 'e'],
  ['e', 'f'],
  ['f', 'g'],
  ['g', 'a'],
  ['h', 'a'],
  ['h', 'g'],
  ['i', 'c'],
  ['i', 'd'],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function Bubble({
  className,
  out,
  lines,
  time,
  delay,
}: {
  className: string;
  out?: boolean;
  lines: [string, string?];
  time: string;
  delay: string;
}) {
  return (
    <div
      className={`convix-float absolute w-52 rounded-2xl border px-3.5 py-2.5 shadow-xl shadow-black/30 backdrop-blur-md ${
        out
          ? 'border-primary/40 bg-primary/25 rounded-br-md'
          : 'border-auth-panel-border bg-auth-panel-foreground/[0.07] rounded-bl-md'
      } ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="space-y-1.5">
        <div className="text-auth-panel-foreground/90 text-[12.5px] leading-snug">
          {lines[0]}
        </div>
        {lines[1] && (
          <div className="text-auth-panel-foreground/60 text-[12.5px] leading-snug">
            {lines[1]}
          </div>
        )}
      </div>
      <div className="text-auth-panel-muted mt-1.5 flex items-center justify-end gap-1 font-mono text-[10px]">
        {time}
        {out && <CheckCheck className="text-primary h-3 w-3" />}
      </div>
    </div>
  );
}

// `compact`: solo la red de contactos + ondas (sin burbujas ni tarjetas), para
// banners bajos como el hero del dashboard.
export function AuthBrandArt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 right-0 select-none ${
        compact ? 'w-full' : 'w-[72%]'
      }`}
    >
      <style>{`
        @keyframes convix-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
        @keyframes convix-pulse { 0% { transform: scale(.4); opacity: .55 } 100% { transform: scale(1); opacity: 0 } }
        @keyframes convix-dash { to { stroke-dashoffset: -24 } }
        .convix-float { animation: convix-float 7s ease-in-out infinite }
        .convix-ring { transform-box: fill-box; transform-origin: center; animation: convix-pulse 4.5s ease-out infinite }
        .convix-link { stroke-dasharray: 3 9; animation: convix-dash 3s linear infinite }
        @media (prefers-reduced-motion: reduce) {
          .convix-float, .convix-ring, .convix-link { animation: none }
        }
      `}</style>

      {/* Red de contactos + ondas de difusión */}
      <svg
        viewBox="0 0 600 640"
        preserveAspectRatio={compact ? 'xMaxYMid meet' : 'xMidYMid meet'}
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <defs>
          <radialGradient id="cx-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="330" cy="330" r="260" fill="url(#cx-hub-glow)" />

        {/* Ondas de difusión desde el hub */}
        {[0, 1.5, 3].map((d) => (
          <circle
            key={d}
            className="convix-ring"
            cx="330"
            cy="330"
            r="250"
            stroke="var(--primary)"
            strokeWidth="1.2"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
        <circle
          cx="330"
          cy="330"
          r="130"
          stroke="var(--primary)"
          strokeOpacity="0.18"
          strokeDasharray="2 7"
        />
        <circle
          cx="330"
          cy="330"
          r="215"
          stroke="var(--primary)"
          strokeOpacity="0.12"
          strokeDasharray="2 9"
        />

        {/* Enlaces */}
        {LINKS.map(([from, to]) => {
          const a = byId[from];
          const b = byId[to];
          const isHub = from === 'hub';
          return (
            <line
              key={`${from}-${to}`}
              className={isHub ? 'convix-link' : undefined}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--primary)"
              strokeOpacity={isHub ? 0.55 : 0.2}
              strokeWidth={isHub ? 1.4 : 1}
            />
          );
        })}

        {/* Contactos */}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r + 6}
              fill="var(--primary)"
              fillOpacity={'hub' in n ? 0.22 : 0.08}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="var(--auth-panel-bg)"
              stroke="var(--primary)"
              strokeOpacity={'hub' in n ? 1 : 0.6}
              strokeWidth={'hub' in n ? 2 : 1.4}
            />
            {/* Avatar: cabeza + hombros */}
            <circle
              cx={n.x}
              cy={n.y - n.r * 0.2}
              r={n.r * 0.3}
              fill="var(--primary)"
              fillOpacity={'hub' in n ? 0.95 : 0.55}
            />
            <path
              d={`M ${n.x - n.r * 0.55} ${n.y + n.r * 0.6} a ${n.r * 0.55} ${n.r * 0.5} 0 0 1 ${n.r * 1.1} 0 z`}
              fill="var(--primary)"
              fillOpacity={'hub' in n ? 0.95 : 0.55}
            />
          </g>
        ))}
      </svg>

      {!compact && (
        <>
          {/* Conversaciones */}
          <Bubble
            className="top-[9%] right-[4%]"
            lines={['¿Tienen disponible el plan Pro?']}
            time="10:42"
            delay="0s"
          />
          <Bubble
            className="top-[24%] right-[16%]"
            out
            lines={['¡Claro! Te envío la propuesta ahora 🚀']}
            time="10:43"
            delay="1.2s"
          />
          <Bubble
            className="top-[41%] right-[1%]"
            lines={['Gracias, quedó perfecto 🙌']}
            time="10:51"
            delay="2.4s"
          />

          {/* Broadcast */}
          <div
            className="convix-float border-auth-panel-border bg-auth-panel-foreground/[0.07] absolute right-[3%] bottom-[20%] flex w-56 items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-xl shadow-black/30 backdrop-blur-md"
            style={{ animationDelay: '3.2s' }}
          >
            <div className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-auth-panel-foreground text-[12.5px] font-medium">
                Campaña de octubre
              </div>
              <div className="text-auth-panel-muted font-mono text-[10.5px]">
                2.481 enviados · 94% leídos
              </div>
            </div>
          </div>

          {/* Pipeline + automatización */}
          <div
            className="convix-float border-auth-panel-border bg-auth-panel-foreground/[0.07] absolute bottom-[7%] left-[22%] w-60 rounded-2xl border p-3 shadow-xl shadow-black/30 backdrop-blur-md"
            style={{ animationDelay: '4.4s' }}
          >
            <div className="text-auth-panel-muted mb-2 flex items-center justify-between font-mono text-[10px] tracking-wider uppercase">
              <span>Pipeline</span>
              <span className="text-primary flex items-center gap-1">
                <Zap className="h-3 w-3" /> auto
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Nuevo', fill: 3 },
                { label: 'Propuesta', fill: 2 },
                { label: 'Ganado', fill: 1 },
              ].map((col, i) => (
                <div key={col.label}>
                  <div className="text-auth-panel-muted mb-1.5 text-[10px]">
                    {col.label}
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: col.fill }).map((_, j) => (
                      <div
                        key={j}
                        className={`h-4 rounded-md ${
                          i === 2
                            ? 'bg-primary/70'
                            : 'bg-auth-panel-foreground/[0.12]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
