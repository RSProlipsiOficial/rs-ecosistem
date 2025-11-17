# 🔗 INTEGRAÇÃO CHECKOUT COMPLETA

**Data:** 09/11/2024
**Status:** ✅ **PRONTO PARA USO**

---

## 🎯 **O QUE FOI INTEGRADO**

### **✅ CHECKOUT UNIFICADO**

Agora você tem **UMA ÚNICA ROTA** que:
1. ✅ Cria o pedido
2. ✅ Gera o pagamento (PIX/Boleto/Checkout Pro)
3. ✅ Acumula R$ 60 para matriz
4. ✅ Adiciona na matriz automaticamente
5. ✅ Distribui bônus quando ciclo completa

**Funciona de qualquer lugar:**
- ✅ Marketplace
- ✅ Escritório do Consultor
- ✅ Painel Admin

---

## 📋 **ROTAS DISPONÍVEIS**

### **1. POST /api/checkout/create** 🛒

**Cria pedido completo com pagamento**

```javascript
// Request:
POST https://api.rsprolipsi.com.br/api/checkout/create
Content-Type: application/json

{
  // Comprador
  "buyerId": "uuid-do-consultor",           // Opcional (cria se não existir)
  "buyerEmail": "cliente@email.com",        // Obrigatório
  "buyerName": "João Silva",                // Obrigatório
  "buyerPhone": "41999999999",              // Opcional
  "buyerCpf": "12345678901",                // Opcional (mas recomendado para PIX/Boleto)
  "buyerType": "cliente",                   // 'cliente', 'consultor', 'cd'
  "referredBy": "uuid-do-patrocinador",     // Opcional (quem indicou)
  
  // Itens
  "items": [
    {
      "product_id": "uuid-do-produto",
      "quantity": 1
    }
  ],
  
  // Entrega
  "shippingAddress": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Curitiba",
    "estado": "PR",
    "cep": "80000-000"
  },
  "shippingMethod": "correios",
  "shippingCost": 15.00,
  
  // Pagamento
  "paymentMethod": "pix",  // 'pix', 'boleto', 'checkout-pro'
  
  // Notas
  "customerNotes": "Entregar pela manhã"
}

// Response:
{
  "success": true,
  "order": {
    "id": "uuid-do-pedido",
    "total": 75.00,
    "status": "pending"
  },
  "payment": {
    "method": "pix",
    "paymentId": "12345678",
    "status": "pending",
    "qr_code": "00020101021243650016COM.MERCADOLIBRE...",
    "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "ticket_url": "https://www.mercadopago.com.br/payments/12345678/ticket"
  }
}
```

---

### **2. GET /api/checkout/status/:orderId** 📊

**Verifica status do pedido**

```javascript
// Request:
GET https://api.rsprolipsi.com.br/api/checkout/status/uuid-do-pedido

// Response:
{
  "success": true,
  "order": {
    "id": "uuid-do-pedido",
    "status": "paid",                // pending, paid, processing, shipped, delivered
    "payment_status": "approved",     // pending, approved, rejected, refunded
    "total": 75.00,
    "created_at": "2024-11-09T19:00:00Z"
  },
  "payment": {
    "status": "approved",
    "status_detail": "accredited",
    "payment_method": "pix"
  }
}
```

---

## 💻 **COMO USAR NO FRONTEND**

### **MARKETPLACE (React)**

```jsx
// pages/Checkout.tsx
import { useState } from 'react';

function Checkout({ cartItems, user }) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  async function handleCheckout() {
    setLoading(true);
    
    try {
      const response = await fetch('https://api.rsprolipsi.com.br/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail: user.email,
          buyerName: user.name,
          buyerPhone: user.phone,
          buyerCpf: user.cpf,
          buyerType: user.type || 'cliente',
          referredBy: user.patrocinador_id,
          
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          
          shippingAddress: user.address,
          shippingMethod: 'correios',
          shippingCost: 15.00,
          
          paymentMethod: 'pix'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mostrar QR Code do PIX
        setQrCode(data.payment.qr_code_base64);
        
        // Começar a verificar status a cada 5 segundos
        const interval = setInterval(async () => {
          const status = await fetch(`https://api.rsprolipsi.com.br/api/checkout/status/${data.order.id}`);
          const statusData = await status.json();
          
          if (statusData.order.payment_status === 'approved') {
            clearInterval(interval);
            // Redirecionar para página de sucesso
            window.location.href = `/sucesso?order=${data.order.id}`;
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* UI do checkout */}
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processando...' : 'Finalizar Pedido'}
      </button>
      
      {qrCode && (
        <div>
          <h3>Pague com PIX:</h3>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code PIX" />
          <p>Aguardando pagamento...</p>
        </div>
      )}
    </div>
  );
}
```

---

### **ESCRITÓRIO DO CONSULTOR**

```jsx
// pages/EscritorioConsultor/Comprar.tsx
import { useState } from 'react';

function ComprarProdutos({ consultor, produtos }) {
  async function comprarAgora(produto) {
    const response = await fetch('https://api.rsprolipsi.com.br/api/checkout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: consultor.id,           // ID do consultor
        buyerEmail: consultor.email,
        buyerName: consultor.nome,
        buyerPhone: consultor.telefone,
        buyerType: 'consultor',          // ← Tipo consultor (50% desconto)
        referredBy: consultor.patrocinador_id,
        
        items: [{
          product_id: produto.id,
          quantity: 1
        }],
        
        shippingAddress: consultor.endereco,
        shippingCost: 0,                 // Frete grátis para consultor
        
        paymentMethod: 'pix'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Exibir QR Code PIX
      mostrarPIX(data.payment.qr_code_base64);
    }
  }

  return (
    <div className="produtos-grid">
      {produtos.map(produto => (
        <div key={produto.id} className="card-produto">
          <h3>{produto.name}</h3>
          <p className="preco-original">De: R$ {produto.price_base}</p>
          <p className="preco-consultor">Por: R$ {produto.price_consultor}</p>
          <p className="economia">Economia: 50%</p>
          <button onClick={() => comprarAgora(produto)}>
            Comprar Agora
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### **PAINEL ADMIN**

```jsx
// pages/Admin/PedidosSimulador.tsx
function SimularCompra() {
  const [resultado, setResultado] = useState(null);

  async function simularCompra() {
    // Admin pode criar pedido para qualquer consultor
    const response = await fetch('https://api.rsprolipsi.com.br/api/checkout/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        buyerId: 'uuid-do-consultor-teste',
        buyerEmail: 'teste@rsprolipsi.com',
        buyerName: 'Teste Admin',
        buyerType: 'consultor',
        referredBy: null,  // Vai para empresa
        
        items: [{
          product_id: 'produto-teste-id',
          quantity: 1
        }],
        
        shippingAddress: { /* endereço completo */ },
        paymentMethod: 'pix'
      })
    });

    const data = await response.json();
    setResultado(data);
  }

  return (
    <div>
      <h2>Simulador de Compra</h2>
      <button onClick={simularCompra}>Simular Compra R$ 60</button>
      
      {resultado && (
        <div>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 **FLUXO AUTOMÁTICO**

### **Cliente compra no Marketplace:**

```
1. Cliente adiciona produto ao carrinho
2. Cliente vai para checkout
3. Frontend chama: POST /api/checkout/create
4. API cria:
   - Pedido em 'orders'
   - Itens em 'order_items'
   - Pagamento PIX no MP
5. API retorna QR Code
6. Cliente paga PIX
7. Webhook MP notifica API
8. API processa:
   - Atualiza pedido → 'paid'
   - Registra venda em 'sales'
   - Acumula R$ 60 em 'matrix_accumulator'
   - Se R$ 60 completo → Adiciona na matriz
   - Se 6 slots → Ciclo completa
   - rs-ops distribui bônus
9. Cliente recebe confirmação
10. Admin vê no painel
11. Consultor vê no escritório
```

---

## 🎯 **PREÇOS AUTOMÁTICOS**

O salesService já calcula preços baseado no `buyerType`:

| Tipo | Desconto | Preço (base R$ 120) |
|------|----------|---------------------|
| `cliente` | 0% | R$ 120,00 |
| `consultor` | 50% | R$ 60,00 |
| `cd` | 57.6% | R$ 50,88 |

**Configurado automaticamente!**

---

## 📊 **RELATÓRIOS**

### **Ver pedidos do consultor:**

```javascript
GET /api/marketplace/orders/:userId
→ Retorna todos os pedidos do consultor
```

### **Ver pedidos no admin:**

```sql
-- No Supabase SQL Editor:
SELECT 
  o.id,
  o.buyer_email,
  o.total,
  o.status,
  o.payment_status,
  o.created_at,
  c.nome as comprador
FROM orders o
LEFT JOIN consultores c ON c.id = o.buyer_id
ORDER BY o.created_at DESC
LIMIT 50;
```

---

## ✅ **ESTÁ PRONTO PARA:**

- [x] Marketplace fazer pedidos
- [x] Escritório do Consultor fazer pedidos
- [x] Admin simular pedidos
- [x] PIX automático
- [x] Boleto automático
- [x] Checkout Pro (redirect)
- [x] Acumulador R$ 60
- [x] Matriz automática
- [x] Bônus automáticos

---

## 🚀 **DEPOIS DO DEPLOY:**

Apenas substituir as chamadas antigas:

**ANTES:**
```javascript
// Marketplace antigo
POST /api/marketplace/orders + POST /api/payment/pix
```

**DEPOIS:**
```javascript
// Novo checkout integrado
POST /api/checkout/create (faz tudo de uma vez!)
```

---

## 📞 **SUPORTE**

**Testar localmente:**
```bash
curl -X POST http://localhost:8080/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "teste@email.com",
    "buyerName": "Teste",
    "items": [{"product_id": "produto-id", "quantity": 1}],
    "paymentMethod": "pix"
  }'
```

**Verificar logs:**
```bash
pm2 logs rs-api | grep "checkout"
```

---

## 🎉 **RESUMO**

✅ **UMA rota faz tudo**
✅ **Funciona de qualquer lugar**
✅ **Integrado com matriz**
✅ **Pronto para usar**

**Basta fazer o deploy!** 🚀
