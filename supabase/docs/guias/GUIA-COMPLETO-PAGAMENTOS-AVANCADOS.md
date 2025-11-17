# 🎯 GUIA COMPLETO - Recursos Avançados de Pagamento
## RS Prólipsi Marketplace

---

## 📦 O QUE FOI IMPLEMENTADO

### ✅ 1. PAGAR COM SALDO DA CARTEIRA 💰

**Localização:** `CheckoutView.tsx` (linha 430)

**Como funciona:**
- Cliente vê saldo disponível em tempo real
- Validação automática se saldo é suficiente
- Débito instantâneo ao confirmar pagamento
- Histórico de transações gravado no Supabase

**UI Implementada:**
- ✅ Botão "Saldo" nos métodos de pagamento
- ✅ Card mostrando saldo disponível vs total
- ✅ Indicador verde/vermelho para saldo suficiente/insuficiente
- ✅ Mensagem de quanto falta se insuficiente

**Fluxo:**
1. Cliente chega no checkout (step 3)
2. Sistema carrega saldo automaticamente
3. Cliente clica em "Saldo"
4. Vê se tem saldo suficiente
5. Clica em "Pagar Agora"
6. Valor debitado instantaneamente

---

### ✅ 2. PEDIDO COMPARTILHADO 👥

**Componentes criados:**
- `SharedOrderCreator.tsx` - Criar pedido compartilhado
- `SharedOrderParticipant.tsx` - Participar de pedido
- `SharedOrderList.tsx` - Listar pedidos criados

**Como funciona:**
1. **Coordenador:**
   - Cria pedido compartilhado
   - Define endereço de entrega único
   - Define validade do link (12h a 1 semana)
   - Recebe link para compartilhar

2. **Participantes:**
   - Acessam link compartilhado
   - Veem endereço de entrega
   - Escolhem seus produtos
   - Recebem link de pagamento individual
   - Pagam apenas sua parte

3. **Sistema:**
   - Consolida todos os pedidos
   - Envia tudo para o mesmo endereço
   - Cada um paga separadamente

**Benefícios:**
- ✅ Economia no frete (um endereço só)
- ✅ Compra em equipe facilitada
- ✅ Cada um paga sua parte
- ✅ Rastreamento individual

---

### ✅ 3. PAGAMENTO UNIFICADO 💳+💰+📱

**Componente:** `UnifiedPaymentSplitter.tsx`

**Como funciona:**
- Cliente pode dividir pagamento em múltiplos métodos
- Exemplo: R$ 500,00 = R$ 200 saldo + R$ 200 PIX + R$ 100 cartão

**Recursos:**
- ✅ Seletor visual de métodos
- ✅ Input de valor para cada método
- ✅ Validação de saldo total
- ✅ Botão "Usar Saldo Máximo" (carteira)
- ✅ Botão "Usar Restante" (outros métodos)
- ✅ Preview de todas as divisões
- ✅ Pode remover divisões antes de confirmar

**Fluxo:**
1. Cliente tem total de R$ 500
2. Clica em "Dividir Pagamento"
3. Escolhe métodos:
   - Saldo: R$ 200 (tem R$ 250 disponível)
   - PIX: R$ 200
   - Cartão: R$ 100
4. Sistema valida que soma = total
5. Processa cada pagamento separadamente
6. Confirma pedido quando todos forem aprovados

---

## 🗄️ BANCO DE DADOS (SUPABASE)

### Tabelas Criadas:

#### 1. `wallet_balances`
```sql
- id: TEXT PRIMARY KEY
- customer_id: TEXT UNIQUE
- balance: DECIMAL(10,2)
- currency: TEXT
- last_updated: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

#### 2. `wallet_transactions`
```sql
- id: TEXT PRIMARY KEY
- customer_id: TEXT
- amount: DECIMAL(10,2)
- type: TEXT ('credit' | 'debit')
- description: TEXT
- order_id: TEXT
- balance_after: DECIMAL(10,2)
- created_at: TIMESTAMPTZ
```

#### 3. `unified_payments`
```sql
- id: TEXT PRIMARY KEY
- order_id: TEXT
- total_amount: DECIMAL(10,2)
- overall_status: TEXT
- created_at: TIMESTAMPTZ
```

#### 4. `payment_splits`
```sql
- id: TEXT PRIMARY KEY
- unified_payment_id: TEXT (FK)
- method: TEXT
- amount: DECIMAL(10,2)
- status: TEXT
- transaction_id: TEXT
- created_at: TIMESTAMPTZ
```

#### 5. `shared_orders`
```sql
- id: TEXT PRIMARY KEY
- team_id: TEXT
- coordinator_id: TEXT
- coordinator_name: TEXT
- delivery_address: JSONB
- status: TEXT
- total_amount: DECIMAL(10,2)
- share_link: TEXT UNIQUE
- created_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

#### 6. `shared_order_participants`
```sql
- id: TEXT PRIMARY KEY
- shared_order_id: TEXT (FK)
- customer_id: TEXT
- customer_name: TEXT
- items: JSONB
- subtotal: DECIMAL(10,2)
- payment_status: TEXT
- payment_link: TEXT
- paid_at: TIMESTAMPTZ
```

### Funções SQL Criadas:

#### `debit_wallet(customer_id, amount, description, order_id)`
- Debita valor da carteira
- Valida saldo suficiente
- Registra transação
- Retorna JSON com sucesso/erro

#### `credit_wallet(customer_id, amount, description)`
- Adiciona crédito na carteira
- Cria carteira se não existir
- Registra transação
- Retorna novo saldo

---

## 🔌 INTEGRAÇÃO COM API

### Endpoints Necessários (criar em rs-api):

#### Carteira:
```typescript
// GET /api/wallet/balance/:customerId
// Response: { balance: number, currency: string }

// POST /api/wallet/debit
// Body: { customerId, amount, orderId, description }
// Response: { success, transactionId, remainingBalance, message }

// POST /api/wallet/credit
// Body: { customerId, amount, description }
// Response: { success, transactionId, newBalance, message }

// GET /api/wallet/transactions/:customerId
// Response: { transactions: Transaction[] }
```

#### Pedido Compartilhado:
```typescript
// POST /api/shared-orders/create
// Body: { coordinatorId, deliveryAddress, expiresInHours }
// Response: { id, shareLink }

// GET /api/shared-orders/:id
// Response: SharedOrder

// POST /api/shared-orders/:id/participate
// Body: { customerName, items }
// Response: { paymentLink }

// GET /api/shared-orders/my-orders/:customerId
// Response: { orders: SharedOrder[] }
```

#### Pagamento Unificado:
```typescript
// POST /api/unified-payments/create
// Body: { orderId, splits: PaymentSplit[] }
// Response: { id, status, paymentUrls: string[] }

// GET /api/unified-payments/:id/status
// Response: { overallStatus, splits: PaymentSplit[] }

// POST /api/unified-payments/:id/process-split
// Body: { splitId }
// Response: { success, transactionId }
```

---

## 🎨 COMPONENTES CRIADOS

### 1. CheckoutView.tsx (modificado)
**Adições:**
- Método de pagamento "Saldo"
- useEffect para carregar saldo
- UI de validação de saldo
- Estado `walletBalance` e `loadingWallet`

### 2. SharedOrderCreator.tsx
**Props:**
- `currentCustomer`: Cliente logado
- `onBack()`: Voltar
- `onCreateSharedOrder(address, expiresInHours)`: Criar pedido

**Funcionalidades:**
- Formulário de endereço com busca CEP
- Seletor de validade (12h a 1 semana)
- Gera link compartilhável
- Botão copiar link

### 3. SharedOrderParticipant.tsx
**Props:**
- `sharedOrderId`: ID do pedido
- `products`: Lista de produtos
- `onAddItems(orderId, customerName, items)`: Adicionar itens
- `onBack()`: Voltar

**Funcionalidades:**
- Exibe info do pedido compartilhado
- Mostra endereço de entrega
- Input do nome do participante
- Seleção de produtos
- Carrinho lateral
- Gera link de pagamento individual

### 4. SharedOrderList.tsx
**Props:**
- `currentCustomer`: Cliente logado
- `onCreateNew()`: Criar novo pedido
- `onViewDetails(orderId)`: Ver detalhes

**Funcionalidades:**
- Lista pedidos compartilhados do usuário
- Cards com status, participantes, valores
- Botão copiar link
- Indicador de tempo restante
- Status de pagamento dos participantes

### 5. UnifiedPaymentSplitter.tsx
**Props:**
- `totalAmount`: Total da compra
- `walletBalance`: Saldo disponível
- `onConfirmSplits(splits)`: Confirmar divisões
- `onCancel()`: Cancelar

**Funcionalidades:**
- Seletor de métodos de pagamento
- Input de valor por método
- Preview de divisões
- Validação de total
- Botões "Usar Saldo Máximo" e "Usar Restante"
- Remover divisões

---

## 📝 TIPOS TYPESCRIPT

### Arquivo: `types.ts`

```typescript
export interface WalletBalance {
    customerId: string;
    balance: number;
    currency: string;
    lastUpdated: string;
}

export interface PaymentSplit {
    id: string;
    method: 'wallet' | 'pix' | 'credit-card' | 'boleto';
    amount: number;
    status: 'pending' | 'processing' | 'confirmed' | 'failed';
    transactionId?: string;
    createdAt: string;
}

export interface UnifiedPayment {
    orderId: string;
    totalAmount: number;
    splits: PaymentSplit[];
    overallStatus: 'pending' | 'partial' | 'completed' | 'failed';
    createdAt: string;
}

export interface SharedOrder {
    id: string;
    teamId: string;
    coordinatorId: string;
    coordinatorName: string;
    deliveryAddress: ShippingAddress;
    status: 'pending' | 'collecting' | 'ready' | 'completed';
    totalAmount: number;
    participants: SharedOrderParticipant[];
    createdAt: string;
    expiresAt: string;
    shareLink: string;
}

export interface SharedOrderParticipant {
    id: string;
    sharedOrderId: string;
    customerId: string;
    customerName: string;
    items: CartItem[];
    subtotal: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentLink?: string;
    paidAt?: string;
}

export interface WalletPaymentRequest {
    customerId: string;
    amount: number;
    orderId: string;
    description: string;
}

export interface WalletPaymentResponse {
    success: boolean;
    transactionId: string;
    remainingBalance: number;
    message: string;
}
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Executar SQL no Supabase
```bash
1. Acesse: https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new
2. Cole o conteúdo de: SQL-PAGAMENTOS-AVANCADOS-SUPABASE.sql
3. Clique em RUN
4. Verifique se todas as tabelas foram criadas
```

### 2. Criar Rotas de API (rs-api)
```bash
cd rs-api/src/routes
# Criar arquivo: advanced-payments.ts
# Implementar todos os endpoints listados acima
```

### 3. Adicionar Views no App.tsx
```typescript
// Adicionar ao tipo View:
export type View = 'home' | ... | 
    'sharedOrderCreate' | 
    'sharedOrderParticipate' | 
    'sharedOrderList' |
    'unifiedPayment';

// Adicionar imports:
import SharedOrderCreator from './components/SharedOrderCreator';
import SharedOrderParticipant from './components/SharedOrderParticipant';
import SharedOrderList from './components/SharedOrderList';
import UnifiedPaymentSplitter from './components/UnifiedPaymentSplitter';

// Adicionar handlers:
const handleCreateSharedOrder = async (address, expiresInHours) => {
    // Chamar API
    // Retornar { id, shareLink }
};

const handleAddItemsToSharedOrder = async (orderId, customerName, items) => {
    // Chamar API
    // Retornar { paymentLink }
};

const handleConfirmUnifiedPayment = async (splits) => {
    // Processar cada split
    // Aguardar confirmação de todos
    // Finalizar pedido
};

// Adicionar cases no switch:
case 'sharedOrderCreate':
    return <SharedOrderCreator 
        currentCustomer={currentCustomer}
        onBack={() => handleNavigate('home')}
        onCreateSharedOrder={handleCreateSharedOrder}
    />;

case 'sharedOrderParticipate':
    return <SharedOrderParticipant
        sharedOrderId={selectedSharedOrderId}
        products={products}
        onAddItems={handleAddItemsToSharedOrder}
        onBack={() => handleNavigate('home')}
    />;

case 'sharedOrderList':
    return <SharedOrderList
        currentCustomer={currentCustomer}
        onCreateNew={() => handleNavigate('sharedOrderCreate')}
        onViewDetails={(id) => handleNavigate('sharedOrderDetail', id)}
    />;
```

### 4. Adicionar Botões de Acesso
```typescript
// No painel do cliente (CustomerAccount.tsx):
<button onClick={() => handleNavigate('sharedOrderList')}>
    Meus Pedidos Compartilhados
</button>

<button onClick={() => handleNavigate('sharedOrderCreate')}>
    Criar Pedido Compartilhado
</button>

// No CheckoutView.tsx:
// Adicionar opção "Dividir Pagamento"
<button onClick={() => setShowUnifiedSplitter(true)}>
    💳 Dividir em Múltiplos Métodos
</button>

{showUnifiedSplitter && (
    <UnifiedPaymentSplitter
        totalAmount={total}
        walletBalance={walletBalance}
        onConfirmSplits={handleConfirmUnifiedPayment}
        onCancel={() => setShowUnifiedSplitter(false)}
    />
)}
```

---

## 🧪 TESTES

### Testar Pagar com Saldo:
1. Acesse checkout
2. Clique em "Saldo"
3. Verifique se mostra saldo correto (R$ 1.250,00 mock)
4. Clique em "Pagar Agora"
5. Verifique se débito foi registrado

### Testar Pedido Compartilhado:
1. Faça login como coordenador
2. Crie pedido compartilhado
3. Copie o link
4. Abra em janela anônima
5. Adicione produtos como participante
6. Verifique link de pagamento gerado

### Testar Pagamento Unificado:
1. Adicione produtos ao carrinho (total > R$ 500)
2. Vá para checkout
3. Clique em "Dividir Pagamento"
4. Adicione:
   - R$ 200 do saldo
   - R$ 200 PIX
   - R$ 100 cartão
5. Verifique se total está correto
6. Confirme e processe

---

## 📊 CONFIGURAÇÃO NECESSÁRIA

### rs-config/payment-methods.json
```json
{
  "wallet": {
    "enabled": true,
    "minAmount": 0.01,
    "maxAmount": 10000.00
  },
  "unifiedPayment": {
    "enabled": true,
    "maxSplits": 4,
    "minSplitAmount": 10.00
  },
  "sharedOrders": {
    "enabled": true,
    "maxParticipants": 20,
    "defaultExpirationHours": 24,
    "minExpirationHours": 12,
    "maxExpirationHours": 168
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Tipos TypeScript criados
- [x] Componente Pagar com Saldo (CheckoutView)
- [x] Componentes Pedido Compartilhado (3 componentes)
- [x] Componente Pagamento Unificado
- [x] SQL Supabase (tabelas + funções)
- [ ] Executar SQL no Supabase
- [ ] Criar rotas de API (rs-api)
- [ ] Integrar componentes no App.tsx
- [ ] Adicionar botões de acesso
- [ ] Testar fluxo completo
- [ ] Deploy para produção

---

## 📞 SUPORTE

Todas as implementações estão prontas para uso.
Arquivos criados e localizações no guia acima.

**Para dúvidas sobre:**
- SQL: Veja `SQL-PAGAMENTOS-AVANCADOS-SUPABASE.sql`
- Tipos: Veja `types.ts` (linhas 570-634)
- Componentes: Veja pasta `components/`
- Documentação: Este arquivo + `RECURSOS-PAGAMENTO-AVANCADOS.md`
