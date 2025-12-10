//# Repositories - Supabase

Camada de acesso ao banco de dados centralizada com Supabase.

## Estrutura

```
repositories/
├── supabase.client.ts    # Cliente Supabase configurado
├── users.repository.ts   # Operações da tabela users
├── matrix.repository.ts  # Operações da tabela matrices
├── bonuses.repository.ts # Operações da tabela bonuses
└── index.ts              # Exportações
```

---

## Configuração

### Variáveis de Ambiente

Adicione no `.env`:

```env
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

> **Importante:** Copie as credenciais de **Credenciais Gerais → rs-prolipse-teste**

---

## Tabelas Esperadas

### `users`
```sql
- id (uuid, PK)
- name (text)
- email (text)
- pin (text)
- wallet_balance (numeric)
- status (text)
- created_at (timestamp)
```

### `matrices`
```sql
- id (uuid, PK)
- user_id (uuid, FK → users)
- matrix_level (int)
- active (boolean)
- reentries (int)
- created_at (timestamp)
```

### `bonuses`
```sql
- id (uuid, PK)
- user_id (uuid, FK → users)
- bonus_type (text) -- 'cycle' | 'depth' | 'fidelity' | 'topSigma'
- amount (numeric)
- created_at (timestamp)
```

---

## Uso

### Users Repository

```typescript
import { usersRepo } from "./repositories";

// Listar todos
const users = await usersRepo.listAll();

// Buscar por ID
const user = await usersRepo.findById("uuid-aqui");

// Atualizar carteira
await usersRepo.updateWallet("uuid-aqui", 150.50);
```

### Matrix Repository

```typescript
import { matrixRepo } from "./repositories";

// Listar matrizes ativas do usuário
const matrices = await matrixRepo.listActive("user-id");

// Registrar novo ciclo
await matrixRepo.registerCycle("user-id", 1);
```

### Bonuses Repository

```typescript
import { bonusRepo } from "./repositories";

// Inserir bônus
await bonusRepo.insert("user-id", "cycle", 108.00);

// Listar bônus do usuário
const bonuses = await bonusRepo.listByUser("user-id");
```

---

## Tratamento de Erros

Todos os métodos usam `formatError()` para padronizar erros:

```typescript
{
  status: 500,
  code: "database_error",
  message: "Descrição do erro"
}
```

---

## Teste Manual

```typescript
// Teste o client Supabase
import { supabase } from "./repositories/supabase.client";

const { data, error } = await supabase.from("users").select("count");
console.log("Conexão OK:", data);
```

---

**Versão:** 1.0.1  
**Última atualização:** Nov 2025
