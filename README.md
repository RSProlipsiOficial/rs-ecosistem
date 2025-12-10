# RS Ecosystem Monorepo

Este repositório contém o ecossistema de aplicações RS Prólipsi, organizado como um monorepo usando PNPM Workspaces.

## Estrutura

- **apps/**: Aplicações executáveis (Admin, Marketplace, API, etc.)
- **packages/**: Bibliotecas compartilhadas (Config, Utils, Supabase Client)
- **infra/**: Configurações de infraestrutura (Docker, Nginx)

## Requisitos

- Node.js 18+
- PNPM (`npm install -g pnpm`)
- Docker & Docker Compose (para rodar backends locais)

## Instalação

```bash
pnpm install
```

## Desenvolvimento

Para rodar todas as aplicações em modo de desenvolvimento:

```bash
pnpm dev
```

Para rodar apenas uma aplicação (ex: marketplace):

```bash
pnpm --filter rs-marketplace-root dev
# ou se o nome do pacote mudou para marketplace---rs-prólipsi:
pnpm --filter marketplace---rs-prólipsi dev
```

## Build

Para compilar todo o projeto:

```bash
pnpm build
```

## Docker

Para subir os serviços de backend (Banco de dados, etc):

```bash
docker-compose up -d
```
