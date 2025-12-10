FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app .
RUN corepack enable && pnpm i -g serve

ENV PORT=3000
EXPOSE 3000

CMD ["serve","-s","dist","-l", "${PORT}"]