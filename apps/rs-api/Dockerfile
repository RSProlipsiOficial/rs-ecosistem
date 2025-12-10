FROM node:20-alpine
WORKDIR /app
ENV PORT=4000
EXPOSE 4000
RUN corepack enable \
  && corepack prepare pnpm@latest --activate
COPY apps/rs-api/package.json apps/rs-api/pnpm-lock.yaml ./
COPY apps/rs-config /rs-config
COPY packages/rs-ops-config /packages/rs-ops-config
RUN pnpm install --frozen-lockfile
COPY apps/rs-api .
CMD ["pnpm","dev"]
