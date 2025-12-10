FROM node:20-alpine AS build
WORKDIR /app
RUN npm i -g pnpm@10.24.0
COPY Marketplace/ ./Marketplace/
WORKDIR /app/Marketplace
ENV NODE_ENV=development
ENV CI=true
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/Marketplace/dist ./Marketplace/dist
ENV PORT=3003
EXPOSE 3003
CMD ["serve","-s","Marketplace/dist","-l","3003"]
