# RS API

Módulo do ecossistema RS Prólipsi. Esqueleto pronto para Nginx + Certbot + GitHub Actions.

API principal do RS Prólipsi construída com **TypeScript + Fastify**.

## Como rodar

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
- `NODE_ENV`: development | production | test
- `PORT`: porta da API (padrão: 5020)
- `API_PREFIX`: prefixo das rotas (padrão: /v1)
- `JWT_SECRET`: chave secreta para JWT

### 3️⃣ Rodar em desenvolvimento
```bash
npm run dev
```

### 4️⃣ Build para produção
```bash
npm run build
npm start
```

## Rotas principais

- **GET** `/v1/health` - Health check
- **GET** `/v1/products` - Listar produtos
- **POST** `/v1/products` - Criar produto
- **GET** `/v1/bonus` - Regras de bônus
- **POST** `/v1/bonus/simulate` - Simular distribuição de bônus

## Estrutura

```
rs-api/
├── public/           # Arquivos estáticos
│   ├── index.html    # Landing page
│   ├── openapi.yaml  # Contrato OpenAPI
│   └── config.json   # Config pública
├── src/
│   ├── index.ts      # Bootstrap
│   ├── app.ts        # Configuração Fastify
│   ├── config/       # Validação de env
│   ├── routes/       # Rotas da API
│   ├── controllers/  # Handlers das rotas
│   ├── services/     # Lógica de negócio
│   ├── repositories/ # Acesso a dados
│   ├── schemas/      # Validação Zod
│   └── middlewares/  # Auth, CORS, etc
```

## Testar

```bash
curl http://localhost:5020/v1/health
curl http://localhost:5020/v1/products
```

## Próximos passos

- [ ] Implementar autenticação JWT no middleware `auth.ts`
- [ ] Conectar Supabase/Prisma no lugar do `memory.db.ts`
- [ ] Adicionar testes unitários
- [ ] Implementar domínios completos (bonus, produtos, pedidos, etc)

Ver **rs-docs/** para especificação detalhada da API.
