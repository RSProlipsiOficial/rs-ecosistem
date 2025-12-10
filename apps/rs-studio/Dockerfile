FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build || true

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app .
RUN corepack enable

ENV PORT=3006
CMD ["sh","-c","pnpm start || node index.js"]