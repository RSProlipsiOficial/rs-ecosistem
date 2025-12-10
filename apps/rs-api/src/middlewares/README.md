# Middlewares RS Prólipsi API

## 📁 Arquivos

- **`auth.ts`** - Autenticação por Bearer token
- **`logger.ts`** - Log de requisições
- **`validate.ts`** - Validação de payloads
- **`errorHandler.ts`** - Tratamento global de erros

---

## 🛡️ auth.ts

Middleware de autenticação simples por token.

### Uso:

```typescript
import { auth } from "./middlewares/auth";

// Rota livre (não requer auth)
app.get("/public", auth(false), handler);

// Rota protegida (requer auth)
app.get("/secure", auth(true), handler);
```

### Configuração:

Defina `API_TOKEN` no `.env`:

```
API_TOKEN=seu-token-secreto-aqui
```

### Teste:

```bash
# Sem token → 401
curl http://localhost:8080/health/secure

# Com token → 200
curl -H "Authorization: Bearer seu-token-secreto-aqui" \
  http://localhost:8080/health/secure
```

---

## 📋 logger.ts

Registra todas as requisições com timestamp, método, rota, status e tempo de resposta.

### Uso automático:

Basta registrar no servidor:

```typescript
import { logger } from "./middlewares/logger";
app.use(logger);
```

### Exemplo de log:

```
[2025-11-06T18:47:20.806Z] GET /health → 200 (5ms)
[2025-11-06T18:47:25.123Z] POST /products → 201 (42ms)
```

---

## ✅ validate.ts

Validador simples de payloads sem dependências externas.

### Uso:

```typescript
import { validateBody, isString, isNumber } from "./middlewares/validate";

app.post("/products", 
  validateBody({
    name: isString,
    price: isNumber,
  }),
  handler
);
```

### Helpers disponíveis:

- `isString` - Verifica se é string não-vazia
- `isNumber` - Verifica se é número válido
- `isBoolean` - Verifica se é booleano

### Custom validators:

```typescript
const isEmail: Check = (v) =>
  typeof v === "string" && v.includes("@") ? true : "invalid_email";

app.post("/users", validateBody({ email: isEmail }), handler);
```

### Resposta de erro:

```json
{
  "error": "invalid_body",
  "details": {
    "name": "must_be_string",
    "price": "must_be_number"
  }
}
```

---

## ⚠️ errorHandler.ts

Captura todos os erros não tratados e retorna resposta padronizada.

### Uso:

Registre **por último** no servidor:

```typescript
import { errorHandler } from "./middlewares/errorHandler";

// ... outras rotas ...

// Error handler por último
app.use(errorHandler);
```

### Resposta:

```json
{
  "error": "internal_error",
  "message": "Unexpected server error"
}
```

### Custom errors:

```typescript
const err: any = new Error("Produto não encontrado");
err.status = 404;
err.code = "product_not_found";
throw err;
```

Retorno:

```json
{
  "error": "product_not_found",
  "message": "Produto não encontrado"
}
```

---

## 🧪 Testando

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env
cp .env.example .env

# 3. Rodar servidor
npm run dev

# 4. Testar health
curl http://localhost:8080/health

# 5. Testar rota protegida (deve dar 401)
curl http://localhost:8080/health/secure

# 6. Testar com token
curl -H "Authorization: Bearer seu-token-secreto-aqui" \
  http://localhost:8080/health/secure
```

---

**Versão:** 1.0.1  
**Última atualização:** Nov 2025
