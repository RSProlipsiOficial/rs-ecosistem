# 🔌 INTEGRAÇÃO COM APIs REAIS
## RS Prólipsi Marketplace

---

## ⚠️ SITUAÇÃO ATUAL

**TODAS AS APIS ESTÃO EM MODO MOCK (SIMULADO)**

Atualmente, o Marketplace funciona com dados fictícios para desenvolvimento.
Nada está conectado às APIs reais ainda.

---

## 📦 O QUE PRECISA SER CONECTADO

### 1. API DE FRETE (MELHOR ENVIO) 🚚

**Status:** ❌ MOCK

**Localização:** `CheckoutView.tsx` (linha ~157)

**Código atual:**
```typescript
const mockOptions: ShippingOption[] = [
    { id: 'retirar', name: 'Retirar no Local', delivery_time: 'Imediato', price: 0.00 },
    { id: 'sedex', name: 'SEDEX', delivery_time: '3 dias úteis', price: 45.00 },
    { id: 'pac', name: 'PAC', delivery_time: '7 dias úteis', price: 25.50 },
    { id: 'melhor-envio-jadlog', name: 'Melhor Envio - Jadlog', delivery_time: '4 dias úteis', price: 32.70 },
];
setShippingOptions(mockOptions);
```

**Como conectar API real:**

1. **Criar endpoint no rs-api:**
```typescript
// POST /api/shipping/calculate
app.post('/api/shipping/calculate', async (req, res) => {
    const { from, to, products } = req.body;
    
    try {
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                'Accept': 'application/json',
                'User-Agent': 'RS Prolipsi (contato@rsprolipsi.com.br)'
            },
            body: JSON.stringify({
                from: { postal_code: from },
                to: { postal_code: to },
                products: products.map(p => ({
                    id: p.id,
                    width: p.width || 11,
                    height: p.height || 17,
                    length: p.length || 11,
                    weight: p.weight || 0.3,
                    insurance_value: p.price,
                    quantity: p.quantity
                }))
            })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao calcular frete' });
    }
});
```

2. **Modificar CheckoutView.tsx:**
```typescript
const fetchShippingOptions = async () => {
    setIsCepLoading(true);
    try {
        const response = await fetch('https://api.rsprolipsi.com.br/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: '04567-000', // CEP da loja
                to: formData.zipCode,
                products: cartItems.map(item => ({
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity,
                    weight: 0.3, // Buscar do produto
                    width: 11,
                    height: 17,
                    length: 11
                }))
            })
        });
        
        const data = await response.json();
        
        // Adicionar "Retirar no Local" manualmente
        const options: ShippingOption[] = [
            { 
                id: 'retirar', 
                name: 'Retirar no Local', 
                delivery_time: 'Imediato', 
                price: 0.00 
            },
            ...data.map(item => ({
                id: item.id,
                name: item.name,
                delivery_time: `${item.delivery_time} dias úteis`,
                price: parseFloat(item.price)
            }))
        ];
        
        setShippingOptions(options);
    } catch (error) {
        console.error('Erro ao buscar frete:', error);
        // Fallback para mock em caso de erro
        setShippingOptions(mockOptions);
    } finally {
        setIsCepLoading(false);
    }
};
```

3. **Variáveis de Ambiente (.env):**
```bash
MELHOR_ENVIO_TOKEN=seu_token_aqui
MELHOR_ENVIO_MODE=sandbox # ou production
```

---

### 2. API DE PAGAMENTO PIX (MERCADO PAGO) 💳

**Status:** ❌ MOCK

**Localização:** `CheckoutView.tsx` (linha ~131)

**Código atual:**
```typescript
// Gerar PIX dinamicamente ao entrar na etapa de pagamento
useEffect(() => {
    if (activeStep === 3 && activePaymentMethod === 'pix' && !pixData && paymentSettings.mercadoPago.enabled) {
        const generatePix = async () => {
            setIsProcessingPayment(true);
            await new Promise(res => setTimeout(res, 1500)); // SIMULAÇÃO
            const mockPixCopyPaste = '00020126...'; // MOCK
            setPixData({
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCopyPaste)}`,
                copyPaste: mockPixCopyPaste,
            });
            setIsProcessingPayment(false);
        };
        generatePix();
    }
}, [activeStep, activePaymentMethod, pixData, paymentSettings.mercadoPago.enabled]);
```

**Como conectar API real:**

1. **Criar endpoint no rs-api:**
```typescript
// POST /api/payments/pix/create
app.post('/api/payments/pix/create', async (req, res) => {
    const { amount, description, orderId, customerEmail } = req.body;
    
    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                transaction_amount: amount,
                description: description,
                payment_method_id: 'pix',
                payer: {
                    email: customerEmail
                },
                external_reference: orderId,
                notification_url: `${process.env.API_URL}/api/payments/webhook`
            })
        });
        
        const data = await response.json();
        
        res.json({
            qrCode: data.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
            paymentId: data.id,
            status: data.status
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar PIX' });
    }
});

// POST /api/payments/webhook (receber confirmação de pagamento)
app.post('/api/payments/webhook', async (req, res) => {
    const { data, type } = req.body;
    
    if (type === 'payment') {
        // Buscar detalhes do pagamento
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
            }
        });
        
        const payment = await response.json();
        
        if (payment.status === 'approved') {
            // Atualizar pedido no banco
            await updateOrderStatus(payment.external_reference, 'paid');
        }
    }
    
    res.status(200).send('OK');
});
```

2. **Modificar CheckoutView.tsx:**
```typescript
const generatePix = async () => {
    setIsProcessingPayment(true);
    try {
        const response = await fetch('https://api.rsprolipsi.com.br/api/payments/pix/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total,
                description: `Pedido #${Date.now()}`,
                orderId: `order-${Date.now()}`,
                customerEmail: currentCustomer?.email || formData.email
            })
        });
        
        const data = await response.json();
        
        setPixData({
            qrCodeUrl: `data:image/png;base64,${data.qrCodeBase64}`,
            copyPaste: data.qrCode,
            paymentId: data.paymentId
        });
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        alert('Erro ao gerar PIX. Tente outro método.');
    } finally {
        setIsProcessingPayment(false);
    }
};
```

3. **Variáveis de Ambiente:**
```bash
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
API_URL=https://api.rsprolipsi.com.br
```

---

### 3. SALDO DA CARTEIRA 💰

**Status:** ❌ MOCK

**Localização:** `CheckoutView.tsx` (linha ~110)

**Código atual:**
```typescript
useEffect(() => {
    if (activeStep === 3 && currentCustomer && !loadingWallet) {
        const loadWalletBalance = async () => {
            setLoadingWallet(true);
            try {
                await new Promise(res => setTimeout(res, 500)); // SIMULAÇÃO
                setWalletBalance(1250.00); // MOCK
            } catch (error) {
                console.error('Erro ao carregar saldo:', error);
                setWalletBalance(0);
            } finally {
                setLoadingWallet(false);
            }
        };
        loadWalletBalance();
    }
}, [activeStep, currentCustomer]);
```

**Como conectar:**

1. **Primeiro, executar SQL no Supabase** (arquivo já criado):
```sql
-- Já está em: SQL-PAGAMENTOS-AVANCADOS-SUPABASE.sql
-- Execute no Supabase Dashboard
```

2. **Criar endpoint no rs-api:**
```typescript
// GET /api/wallet/balance/:customerId
app.get('/api/wallet/balance/:customerId', async (req, res) => {
    const { customerId } = req.params;
    
    const { data, error } = await supabase
        .from('wallet_balances')
        .select('balance, currency')
        .eq('customer_id', customerId)
        .single();
    
    if (error) {
        return res.status(404).json({ balance: 0, currency: 'BRL' });
    }
    
    res.json(data);
});

// POST /api/wallet/debit
app.post('/api/wallet/debit', async (req, res) => {
    const { customerId, amount, orderId, description } = req.body;
    
    const { data, error } = await supabase
        .rpc('debit_wallet', {
            p_customer_id: customerId,
            p_amount: amount,
            p_description: description,
            p_order_id: orderId
        });
    
    res.json(data);
});
```

3. **Modificar CheckoutView.tsx:**
```typescript
const loadWalletBalance = async () => {
    setLoadingWallet(true);
    try {
        const response = await fetch(
            `https://api.rsprolipsi.com.br/api/wallet/balance/${currentCustomer.id}`
        );
        const data = await response.json();
        setWalletBalance(data.balance);
    } catch (error) {
        console.error('Erro ao carregar saldo:', error);
        setWalletBalance(0);
    } finally {
        setLoadingWallet(false);
    }
};
```

---

### 4. CARTÃO DE CRÉDITO 💳

**Status:** ❌ NÃO IMPLEMENTADO

**Precisa:**
1. Integrar com Mercado Pago Checkout Pro
2. Ou usar Mercado Pago Checkout Transparente
3. Processar pagamento via API

**Exemplo básico:**
```typescript
// No CheckoutView, ao processar cartão:
const processCardPayment = async () => {
    const response = await fetch('https://api.rsprolipsi.com.br/api/payments/card/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cardNumber: cardDetails.number,
            cardName: cardDetails.name,
            expiry: cardDetails.expiry,
            cvv: cardDetails.cvv,
            amount: total,
            installments: 1,
            orderId: `order-${Date.now()}`,
            customerEmail: currentCustomer?.email
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'approved') {
        // Pedido aprovado
    }
};
```

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### Melhor Envio:
- [ ] Criar conta no Melhor Envio
- [ ] Obter token de API (sandbox primeiro)
- [ ] Configurar CEP de origem da loja
- [ ] Adicionar dimensões nos produtos
- [ ] Criar endpoint /api/shipping/calculate
- [ ] Modificar CheckoutView para usar API real
- [ ] Testar com CEPs reais
- [ ] Mudar para produção

### Mercado Pago PIX:
- [ ] Criar conta Mercado Pago
- [ ] Obter Access Token
- [ ] Configurar webhook URL
- [ ] Criar endpoint /api/payments/pix/create
- [ ] Criar endpoint /api/payments/webhook
- [ ] Modificar CheckoutView para gerar PIX real
- [ ] Testar pagamento em sandbox
- [ ] Mudar para produção

### Saldo da Carteira:
- [x] SQL criado
- [ ] Executar SQL no Supabase
- [ ] Criar endpoints GET /balance e POST /debit
- [ ] Modificar CheckoutView para buscar saldo real
- [ ] Testar débito da carteira
- [ ] Implementar recarga de saldo

### Cartão de Crédito:
- [ ] Escolher SDK (Mercado Pago ou outro)
- [ ] Integrar SDK no frontend
- [ ] Criar endpoint de processamento
- [ ] Implementar tokenização segura
- [ ] Validar PCI compliance
- [ ] Testar transações

---

## 🔐 SEGURANÇA

### Variáveis de Ambiente (rs-api/.env):
```bash
# Melhor Envio
MELHOR_ENVIO_TOKEN=seu_token
MELHOR_ENVIO_MODE=sandbox

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_chave
MERCADO_PAGO_MODE=sandbox

# Supabase (já tem)
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key

# API
API_URL=https://api.rsprolipsi.com.br
```

### Nunca expor:
- ❌ Access Tokens no frontend
- ❌ Service Keys no código
- ❌ Dados de cartão sem criptografia
- ❌ Senhas ou secrets

---

## 📞 PRÓXIMOS PASSOS

1. **Executar SQL no Supabase** ✅ Arquivo pronto
2. **Criar endpoints de API** ⏳ Exemplos acima
3. **Testar em sandbox** ⏳
4. **Validar com pagamentos reais** ⏳
5. **Deploy para produção** ⏳

---

## 💡 OBSERVAÇÕES

- **Todos os dados atuais são MOCK**
- **Nenhum pagamento real é processado**
- **Frete é fictício**
- **Saldo da carteira é simulado (R$ 1.250,00)**
- **PIX gerado é fake**

Para conectar tudo, siga os passos acima em cada seção.
