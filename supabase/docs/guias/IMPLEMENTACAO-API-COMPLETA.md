# 🚀 IMPLEMENTAÇÃO COMPLETA - RS-API

**Data:** 06/11/2025  
**Status:** EM DESENVOLVIMENTO  
**Objetivo:** Implementar 54 endpoints + autenticação + middlewares

---

## 📁 ESTRUTURA DA API:

```
rs-api/
├── src/
│   ├── config/
│   │   ├── database.ts          ✅ Supabase
│   │   ├── jwt.ts               ⏳ JWT config
│   │   └── integrations.ts      ⏳ APIs externas
│   │
│   ├── middlewares/
│   │   ├── auth.ts              ⏳ Autenticação JWT
│   │   ├── roles.ts             ⏳ Verificação de roles
│   │   ├── rateLimit.ts         ⏳ Rate limiting
│   │   ├── validator.ts         ⏳ Validação de dados
│   │   └── errorHandler.ts      ⏳ Tratamento de erros
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       ⏳ Login, registro, refresh
│   │   ├── matrix.routes.ts     ⏳ Matriz SIGMA
│   │   ├── bonus.routes.ts      ⏳ Bônus (profundidade, fidelidade)
│   │   ├── topSigma.routes.ts   ⏳ TOP SIGMA
│   │   ├── career.routes.ts     ⏳ Plano de carreira
│   │   ├── wallet.routes.ts     ⏳ Carteira
│   │   ├── orders.routes.ts     ⏳ Pedidos
│   │   ├── shared.routes.ts     ⏳ Pedidos compartilhados
│   │   ├── notifications.routes.ts ⏳ Notificações
│   │   └── admin.routes.ts      ⏳ Admin
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── matrix.controller.ts
│   │   ├── bonus.controller.ts
│   │   ├── topSigma.controller.ts
│   │   ├── career.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── shared.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── matrix.service.ts
│   │   ├── bonus.service.ts
│   │   ├── topSigma.service.ts
│   │   ├── career.service.ts
│   │   ├── wallet.service.ts
│   │   ├── orders.service.ts
│   │   ├── notifications.service.ts
│   │   └── integrations/
│   │       ├── supabase.service.ts
│   │       ├── walletpay.service.ts
│   │       ├── twilio.service.ts
│   │       ├── sendgrid.service.ts
│   │       └── correios.service.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Matrix.ts
│   │   ├── Bonus.ts
│   │   ├── Career.ts
│   │   ├── Wallet.ts
│   │   └── Order.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   └── index.ts                 ✅ Entry point
│
├── .env.example                 ⏳ Variáveis de ambiente
├── package.json                 ✅ Dependências
└── tsconfig.json               ✅ TypeScript config
```

---

## 🔐 1. AUTENTICAÇÃO (6 ENDPOINTS):

### Arquivo: `src/routes/auth.routes.ts`

```typescript
POST   /v1/auth/register         - Registrar novo usuário
POST   /v1/auth/login            - Login (retorna JWT)
POST   /v1/auth/refresh          - Refresh token
POST   /v1/auth/logout           - Logout
POST   /v1/auth/forgot-password  - Esqueci senha
POST   /v1/auth/reset-password   - Resetar senha
```

**Dados necessários:**
- ✅ JWT Secret (gerar)
- ✅ Bcrypt rounds: 10
- ✅ Token expiration: 7d
- ✅ Roles: 6 definidos

---

## 🔷 2. MATRIZ SIGMA (6 ENDPOINTS):

### Arquivo: `src/routes/matrix.routes.ts`

```typescript
POST   /v1/matrix/create         - Criar matriz
GET    /v1/matrix/:id            - Ver matriz específica
POST   /v1/matrix/:id/fill       - Preencher slot
GET    /v1/matrix/:id/status     - Status da matriz
POST   /v1/matrix/:id/cycle      - Completar ciclo
GET    /v1/matrix/user/:userId   - Matrizes do usuário
```

**Dados necessários:**
- ✅ Valor: R$ 360,00
- ✅ Payout: R$ 108,00 (30%)
- ✅ Estrutura: 1x6
- ✅ Reentrada: automática (limite 10/mês)

---

## 💰 3. BÔNUS (9 ENDPOINTS):

### Arquivo: `src/routes/bonus.routes.ts`

```typescript
// Profundidade
GET    /v1/bonus/depth/:userId           - Bônus de profundidade
GET    /v1/bonus/depth/history/:userId   - Histórico
POST   /v1/bonus/depth/calculate         - Calcular (admin)

// Fidelidade
GET    /v1/bonus/fidelity/:userId        - Bônus fidelidade
GET    /v1/bonus/fidelity/pool           - Pool mensal
POST   /v1/bonus/fidelity/close          - Fechar mês (admin)

// Geral
GET    /v1/bonus/summary/:userId         - Resumo de todos bônus
GET    /v1/bonus/history/:userId         - Histórico completo
GET    /v1/bonus/pending                 - Bônus pendentes
```

**Dados necessários:**
- ✅ Profundidade: 6,81% (L1-L6)
- ✅ Fidelidade: 1,25%
- ✅ Valores por nível definidos

---

## 🏆 4. TOP SIGMA (5 ENDPOINTS):

### Arquivo: `src/routes/topSigma.routes.ts`

```typescript
GET    /v1/top-sigma/ranking             - Ranking atual
GET    /v1/top-sigma/user/:id            - Posição do usuário
GET    /v1/top-sigma/pool                - Pool do mês
POST   /v1/top-sigma/close               - Fechar mês (admin)
GET    /v1/top-sigma/history             - Histórico
```

**Dados necessários:**
- ✅ Base: 4,5%
- ✅ Top 10
- ✅ Distribuição: 2%, 1.5%, 1.2%...

---

## 📈 5. CARREIRA (6 ENDPOINTS):

### Arquivo: `src/routes/career.routes.ts`

```typescript
GET    /v1/career/pin/:userId            - PIN atual
GET    /v1/career/progress/:userId       - Progresso para próximo PIN
GET    /v1/career/vmec/:userId           - VMEC aplicado
POST   /v1/career/qualify                - Verificar qualificação
GET    /v1/career/history/:userId        - Histórico de PINs
POST   /v1/career/close-quarter          - Fechar trimestre (admin)
```

**Dados necessários:**
- ✅ 13 PINs
- ✅ VMEC por PIN
- ✅ Base: 6,39%

---

## 💳 6. WALLET (6 ENDPOINTS):

### Arquivo: `src/routes/wallet.routes.ts`

```typescript
GET    /v1/wallet/:userId                - Saldo
GET    /v1/wallet/:userId/history        - Histórico
POST   /v1/wallet/withdraw               - Solicitar saque
POST   /v1/wallet/transfer               - Transferir
GET    /v1/wallet/withdrawals            - Saques pendentes
POST   /v1/wallet/approve/:id            - Aprovar saque (admin)
```

**Dados necessários:**
- ✅ Taxa saque: 2%
- ✅ Taxa transferência: 1%
- ✅ Janelas: 1-5, 10-15

---

## 🛒 7. PEDIDOS (8 ENDPOINTS):

### Arquivo: `src/routes/orders.routes.ts`

```typescript
POST   /v1/origin/select                 - Escolher origem
GET    /v1/origin                        - Origem atual
GET    /v1/catalog                       - Produtos (filtrado)
POST   /v1/order/create                  - Criar pedido
GET    /v1/order/:id                     - Ver pedido
GET    /v1/order/:id/tracking            - Rastreamento
PUT    /v1/order/:id/cancel              - Cancelar
GET    /v1/orders/user/:userId           - Pedidos do usuário
```

**Dados necessários:**
- ✅ Origem fixa (CD/Central/Afiliado)
- ✅ 4 CDs cadastrados

---

## 🤝 8. PEDIDOS COMPARTILHADOS (5 ENDPOINTS):

### Arquivo: `src/routes/shared.routes.ts`

```typescript
POST   /v1/shared-order/create           - Criar pedido compartilhado
POST   /v1/shared-order/join/:id         - Participar de grupo
POST   /v1/shared-order/pay/:id          - Pagar parte
GET    /v1/shared-order/:id              - Ver pedido compartilhado
GET    /v1/shared-order/:id/progress     - Progresso de pagamento
```

**Dados necessários:**
- ✅ 2-10 participantes
- ✅ Progresso: 20%, 40%, 60%, 80%, 100%

---

## 🔔 9. NOTIFICAÇÕES (5 ENDPOINTS):

### Arquivo: `src/routes/notifications.routes.ts`

```typescript
POST   /v1/notifications/send            - Enviar notificação
GET    /v1/notifications/:userId         - Notificações do usuário
PUT    /v1/notifications/:id/read        - Marcar como lida
GET    /v1/notifications/preferences/:userId - Preferências
PUT    /v1/notifications/preferences     - Atualizar preferências
```

**Dados necessários:**
- ✅ 4 canais (email, push, WhatsApp, SMS)
- ✅ 30+ eventos

---

## 👨‍💼 10. ADMIN (6 ENDPOINTS):

### Arquivo: `src/routes/admin.routes.ts`

```typescript
GET    /v1/admin/dashboard               - Dashboard
GET    /v1/admin/users                   - Lista usuários
GET    /v1/admin/pending                 - Pendências
POST   /v1/admin/approve/:type/:id       - Aprovar
GET    /v1/admin/reports/:type           - Relatórios
GET    /v1/admin/stats                   - Estatísticas
```

---

## 🔧 MIDDLEWARES:

### 1. `auth.ts` - Autenticação JWT
```typescript
- Verifica token JWT
- Decodifica payload
- Anexa user ao request
```

### 2. `roles.ts` - Verificação de Roles
```typescript
- Verifica role do usuário
- Valida permissões
- Bloqueia acesso não autorizado
```

### 3. `rateLimit.ts` - Rate Limiting
```typescript
- 100 requisições / 15 minutos
- Por IP
- Mensagem customizada
```

### 4. `validator.ts` - Validação
```typescript
- Valida body, params, query
- Sanitiza inputs
- Retorna erros claros
```

### 5. `errorHandler.ts` - Tratamento de Erros
```typescript
- Captura todos os erros
- Formata resposta
- Loga erros
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.38.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "axios": "^1.6.2",
    "twilio": "^4.19.0",
    "@sendgrid/mail": "^7.7.0",
    "firebase-admin": "^12.0.0",
    "bullmq": "^5.1.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
```

---

## 🔑 VARIÁVEIS DE AMBIENTE (.env):

```env
# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=CHANGE_THIS_IN_PRODUCTION
JWT_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+5541999286392

# SendGrid (Email)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=rsprolipsioficial@gmail.com

# Firebase (Push)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# WalletPay
WALLETPAY_API_KEY=
WALLETPAY_API_URL=

# Correios
CORREIOS_API_KEY=

# Melhor Envio
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...

# Asaas
ASAAS_API_KEY=9de0b2ef-9d5d-462d-87f7-1780650fbdb3
```

---

## 🎯 PRÓXIMOS PASSOS:

1. ⏳ Criar todos os arquivos de rotas
2. ⏳ Implementar controllers
3. ⏳ Implementar services
4. ⏳ Criar middlewares
5. ⏳ Configurar integrações
6. ⏳ Testar endpoints
7. ⏳ Documentar no Swagger

---

## 💛🖤 STATUS:

**PLANEJAMENTO: 100% ✅**  
**IMPLEMENTAÇÃO: 0% ⏳**

**Próximo:** Criar arquivos e implementar código!

Quer que eu comece a criar os arquivos agora?
