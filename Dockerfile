# ============================================================
# Convix — imagen autocontenida (SPA Vite + servidor Node/Hono)
# Corre en cualquier host de contenedores; solo necesita un
# PostgreSQL alcanzable vía DATABASE_URL. Un solo proceso sirve la API (/api)
# y el frontend estático (dist/) en el mismo origen.
# ============================================================

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# VITE_APP_LOCALE decide qué mensajes se compilan en el bundle (src/i18n/messages.ts).
# Se incrusta al compilar: no alcanza con setearla solo en runtime (docker-compose
# `environment:`). Default "en" si no se pasa nada.
ARG VITE_APP_LOCALE=en
ENV VITE_APP_LOCALE=$VITE_APP_LOCALE
RUN npm run build

FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S convix && adduser -S convix -G convix

COPY --from=prod-deps --chown=convix:convix /app/node_modules ./node_modules
COPY --from=build --chown=convix:convix /app/package.json ./package.json
COPY --from=build --chown=convix:convix /app/dist ./dist
COPY --from=build --chown=convix:convix /app/dist-server ./dist-server
# Migraciones + runner (el entrypoint las aplica antes de arrancar).
COPY --from=build --chown=convix:convix /app/db ./db
COPY --from=build --chown=convix:convix /app/scripts/migrate.mjs ./scripts/migrate.mjs

# Storage local por defecto (montar un volumen en /app/data).
RUN mkdir -p /app/data/storage && chown -R convix:convix /app/data

USER convix
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "node scripts/migrate.mjs && node dist-server/index.mjs"]
