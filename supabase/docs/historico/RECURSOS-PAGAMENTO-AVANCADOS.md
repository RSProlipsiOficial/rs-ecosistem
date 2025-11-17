# 🛒 Recursos Avançados de Pagamento - Marketplace RS Prólipsi

## Status Atual
✅ **Implementado:**
- Pagamento com Cartão
- Pagamento com PIX
- Pagamento com Boleto
- Opção "Retirar no Local" (frete grátis)
- Order Bump opcional

## 🔨 A Implementar:

### 1. **Pagar com Saldo da Carteira** 💰
**Descrição:** Cliente pode usar o saldo da sua carteira RS para pagar a compra.

**Onde configurar:**
- `rs-ops` ou `rs-api` - Verificar saldo da carteira do cliente
- Criar endpoint: `GET /api/wallet/balance/:customer_id`
- Criar endpoint: `POST /api/wallet/debit` (debitar da carteira)

**Implementação necessária:**
```typescript
// CheckoutView.tsx - Adicionar novo método de pagamento
const [activePaymentMethod, setActivePaymentMethod] = useState<'credit-card' | 'pix' | 'boleto' | 'wallet'>('credit-card');

// Botão de pagamento com saldo
<button onClick={() => setActivePaymentMethod('wallet')} 
    className={...}>
    <WalletIcon className="w-5 h-5"/> Saldo da Carteira
</button>

// Exibir saldo disponível
{activePaymentMethod === 'wallet' && (
    <div>
        <p>Saldo disponível: R$ {walletBalance}</p>
        <p>Total da compra: R$ {total}</p>
        {walletBalance >= total ? (
            <p className="text-green-500">✓ Saldo suficiente</p>
        ) : (
            <p className="text-red-500">Saldo insuficiente</p>
        )}
    </div>
)}
```

---

### 2. **Pedido Compartilhado (Pedido de Equipe)** 👥
**Descrição:** Várias pessoas da equipe fazem pedidos individuais que são unificados em um único endereço de entrega.

**Onde configurar:**
- `rs-core` ou `rs-config` - Configuração de equipes/grupos
- Tabela no Supabase: `shared_orders`

**Estrutura do banco:**
```sql
CREATE TABLE shared_orders (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    delivery_address JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shared_order_items (
    id TEXT PRIMARY KEY,
    shared_order_id TEXT REFERENCES shared_orders(id),
    customer_id TEXT NOT NULL,
    customer_name TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending',
    payment_link TEXT
);
```

**Fluxo:**
1. Coordenador da equipe cria um "Pedido Compartilhado"
2. Gera link único para a equipe
3. Cada membro da equipe:
   - Acessa o link
   - Escolhe seus produtos
   - Recebe link individual de pagamento
   - Paga apenas a sua parte
4. Quando todos pagarem → Pedido é enviado para o endereço único

**Implementação necessária:**
```typescript
// Criar novo componente: SharedOrderCreator.tsx
interface SharedOrderCreatorProps {
    onCreateSharedOrder: (address: Address, teamMembers: string[]) => void;
}

// Criar novo componente: SharedOrderParticipant.tsx  
interface SharedOrderParticipantProps {
    sharedOrderId: string;
    onAddItems: (items: CartItem[], customerId: string) => void;
}
```

---

### 3. **Pagamento Unificado (Múltiplos Métodos)** 💳+💰+📱
**Descrição:** Cliente pode combinar diferentes formas de pagamento em uma única compra.

**Exemplo:**
- Total: R$ 500,00
- Pagar R$ 200,00 com Saldo da Carteira
- Pagar R$ 200,00 com PIX
- Pagar R$ 100,00 com Cartão

**Implementação necessária:**
```typescript
// CheckoutView.tsx - Estado para múltiplos pagamentos
interface PaymentSplit {
    method: 'wallet' | 'pix' | 'credit-card' | 'boleto';
    amount: number;
    status: 'pending' | 'confirmed';
    transactionId?: string;
}

const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([]);
const [remainingAmount, setRemainingAmount] = useState(total);

// Componente para adicionar divisões de pagamento
<div className="space-y-4">
    <h3>Dividir Pagamento</h3>
    <p>Total: R$ {total}</p>
    <p>Restante: R$ {remainingAmount}</p>
    
    {paymentSplits.map((split, index) => (
        <div key={index}>
            <p>{split.method}: R$ {split.amount}</p>
            <button onClick={() => removePaymentSplit(index)}>Remover</button>
        </div>
    ))}
    
    {remainingAmount > 0 && (
        <div>
            <select onChange={(e) => setSelectedSplitMethod(e.target.value)}>
                <option value="wallet">Saldo da Carteira</option>
                <option value="pix">PIX</option>
                <option value="credit-card">Cartão</option>
            </select>
            <input 
                type="number" 
                max={remainingAmount}
                placeholder="Valor"
                onChange={(e) => setSplitAmount(Number(e.target.value))}
            />
            <button onClick={addPaymentSplit}>Adicionar</button>
        </div>
    )}
</div>
```

**Estrutura do banco:**
```sql
CREATE TABLE split_payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id),
    payment_method TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📂 Onde Encontrar as Configurações:

### 1. **rs-api** - Backend API
- Rotas de pagamento
- Integração com gateways
- Webhooks

### 2. **rs-ops** - Operações
- Jobs de processamento de pagamentos
- Reconciliação de pagamentos
- Notificações

### 3. **rs-config** - Configurações
- Configuração de métodos de pagamento
- Limites e regras de negócio
- Integrações de gateways

### 4. **rs-core** - Biblioteca Compartilhada
- Tipos e interfaces
- Funções utilitárias de pagamento
- Validações

### 5. **rs-logistica** - Logística
- Cálculo de frete
- Integração com transportadoras
- Opção "Retirar no Local"

---

## 🎯 Próximos Passos Recomendados:

1. **Implementar Pagar com Saldo** (mais simples)
   - Criar endpoint de saldo
   - Adicionar botão no checkout
   - Validar saldo suficiente

2. **Implementar Pedido Compartilhado** (complexidade média)
   - Criar tabelas no Supabase
   - Criar componente de criação
   - Criar componente de participação
   - Sistema de links únicos

3. **Implementar Pagamento Unificado** (mais complexo)
   - Criar lógica de divisão
   - Processar cada pagamento individualmente
   - Reconciliar todos os pagamentos
   - Confirmar pedido apenas quando 100% pago

---

## ⚙️ Configuração Necessária:

Veja os arquivos em:
- `rs-api/src/config/payment.config.js`
- `rs-ops/src/jobs/payment-processor.js`
- `rs-config/payment-methods.json`
- `rs-core/src/types/payment.types.ts`

Para pedidos compartilhados:
- `rs-config/shared-orders.config.json`
- `rs-api/src/routes/shared-orders.ts`
