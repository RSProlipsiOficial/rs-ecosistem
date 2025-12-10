# Dockerfile para rs-core (contexto: apps/rs-core)
FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/rs-core/package.json apps/rs-core/pnpm-lock.yaml ./
COPY packages/rs-ops-config /packages/rs-ops-config
RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/rs-core .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app .
RUN corepack enable

ENV PORT=4001
EXPOSE 4001

CMD ["pnpm", "start"]