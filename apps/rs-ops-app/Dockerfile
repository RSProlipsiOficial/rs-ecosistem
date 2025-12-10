FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --prod --frozen-lockfile

ENV PORT=3014
EXPOSE 3014

CMD ["pnpm","start"]