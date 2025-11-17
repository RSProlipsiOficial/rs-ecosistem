# ✅ FINALIZAR DEPLOY - 2 PASSOS RÁPIDOS

**Tempo:** 3 minutos
**O que falta:** SQL + Webhook MP

---

## 🗄️ PASSO 1: SUPABASE SQL (1 minuto)

### **Opção A - Verificar se já existe:**

1. **Acesse:** https://rptkhrboejbwexseikuo.supabase.co/project/rptkhrboejbwexseikuo/sql/new

2. **Cole e execute:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('consultores', 'wallets', 'orders', 'matriz_cycles', 'cycle_events')
ORDER BY table_name;
```

3. **Se retornar 5 tabelas:** ✅ Banco já configurado! Pule para o Passo 2.

4. **Se retornar vazio:** Execute a Opção B abaixo.

---

### **Opção B - Executar SQL completo:**

1. **Abra o arquivo:** `DEPLOY-SQL-UNICO.sql`

2. **Copie TUDO** (Ctrl+A, Ctrl+C)

3. **Cole no SQL Editor:** https://rptkhrboejbwexseikuo.supabase.co/project/rptkhrboejbwexseikuo/sql/new

4. **Clique em RUN** (botão verde)

5. **Aguarde:** ~10 segundos

6. **Verificar:** Deve aparecer "Success"

---

### **Habilitar Realtime:**

1. **Menu:** Database → Replication

2. **Procure:** `cycle_events`

3. **Ative:** Toggle ON

4. **Salve:** Botão Save

---

## 💳 PASSO 2: WEBHOOK MERCADO PAGO (1 minuto)

### **Configurar manualmente:**

1. **Acesse:** https://www.mercadopago.com.br/developers/panel/webhooks

2. **Login:** Use suas credenciais MP

3. **Clique:** "Criar webhook" ou "Add webhook"

4. **Preencha:**
   - **URL:** `https://api.rsprolipsi.com.br/api/webhook/mercadopago`
   - **Eventos:** Marque "Pagamentos" ou "payment"
   
5. **Salvar**

6. **Testar:** Clique em "Enviar teste"

---

## ✅ VERIFICAÇÃO FINAL (30 segundos)

### **1. Verificar tabelas criadas:**

```sql
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Esperado:** 17+ tabelas

---

### **2. Verificar produto seed:**

```sql
SELECT id, name, sku, price_consultor 
FROM product_catalog 
WHERE sku = 'KIT-SIGMA-1X6';
```

**Esperado:** 1 linha (Kit de Ativação SIGMA)

---

### **3. Ver logs da API:**

```bash
ssh root@72.60.144.245 "pm2 logs server-marketplace --lines 20"
```

**Esperado:**
```
✅ Servidor rodando na porta 8080
💳 Mercado Pago: ✅ Configurado
📦 Melhor Envio: ✅ Configurado
```

---

### **4. Testar endpoint checkout:**

```bash
curl https://api.rsprolipsi.com.br/api/checkout/create
```

**Esperado:** Erro de validação (normal, falta dados)

---

## 🎉 SISTEMA 100% ONLINE!

Após os 2 passos:

### **URLs Ativas:**
- ✅ **API:** https://api.rsprolipsi.com.br
- ✅ **Admin:** https://admin.rsprolipsi.com.br
- ✅ **Marketplace:** https://marketplace.rsprolipsi.com.br
- ✅ **Escritório:** https://escritorio.rsprolipsi.com.br

### **Funcionalidades:**
- ✅ Checkout integrado (PIX, Boleto, Checkout Pro)
- ✅ Acumulador R$ 60
- ✅ Spillover automático
- ✅ Compressão dinâmica
- ✅ Webhook MP ativo
- ✅ Supabase Realtime
- ✅ Triggers automáticos
- ✅ Bônus rs-ops

### **Fluxo Completo:**
```
Compra R$ 60 → Webhook → Acumula → Ativa matriz → 
Spillover → Preenche slot → 6 slots → Ciclo fecha → 
Evento → rs-ops → Bônus → Wallet → Admin/Consultor veem
```

**TUDO AUTOMÁTICO!** 🚀

---

## 🧪 TESTE COMPLETO (Opcional)

### **1. Criar consultor teste:**

```sql
INSERT INTO consultores (nome, email, cpf, status)
VALUES ('Teste Sistema', 'teste@rsprolipsi.com.br', '00000000001', 'ativo')
RETURNING id;

-- Copie o ID retornado
```

### **2. Criar wallet:**

```sql
INSERT INTO wallets (user_id, consultor_id, balance)
VALUES ('ID_CONSULTOR', 'ID_CONSULTOR', 0.00);
```

### **3. Fazer pedido teste:**

```bash
curl -X POST https://api.rsprolipsi.com.br/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "teste@rsprolipsi.com.br",
    "buyerName": "Teste Sistema",
    "buyerId": "ID_CONSULTOR",
    "buyerType": "consultor",
    "items": [{"product_id": "ID_PRODUTO_SIGMA", "quantity": 1}],
    "shippingAddress": {
      "rua": "Rua Teste",
      "numero": "123",
      "cidade": "Curitiba",
      "estado": "PR",
      "cep": "80000-000"
    },
    "paymentMethod": "pix"
  }'
```

### **4. Verificar retorno:**

Deve retornar:
- `order.id`
- `payment.qr_code` (PIX)
- `payment.paymentId`

### **5. Verificar no banco:**

```sql
-- Pedido criado:
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Itens:
SELECT * FROM order_items ORDER BY created_at DESC LIMIT 1;

-- Acumulador:
SELECT * FROM matrix_accumulator WHERE consultor_id = 'ID_CONSULTOR';
```

---

## 📊 MONITORAMENTO

### **Logs em tempo real:**

```bash
# API:
ssh root@72.60.144.245 "pm2 logs server-marketplace --lines 0"

# Filtrar por tipo:
ssh root@72.60.144.245 "pm2 logs server-marketplace | grep '🔔'"  # Webhooks
ssh root@72.60.144.245 "pm2 logs server-marketplace | grep '💰'"  # Compras
ssh root@72.60.144.245 "pm2 logs server-marketplace | grep '🎯'"  # Ciclos
```

### **Queries úteis:**

```sql
-- Ciclos abertos:
SELECT c.nome, mc.cycle_number, mc.slots_filled, mc.opened_at
FROM matriz_cycles mc
JOIN consultores c ON c.id = mc.consultor_id
WHERE mc.status = 'open'
ORDER BY mc.opened_at DESC;

-- Últimos eventos:
SELECT ce.event_type, ce.created_at, c.nome
FROM cycle_events ce
JOIN consultores c ON c.id = ce.consultor_id
ORDER BY ce.created_at DESC
LIMIT 10;

-- Pedidos hoje:
SELECT COUNT(*), SUM(total), status
FROM orders
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY status;
```

---

## 🆘 TROUBLESHOOTING

### **Webhook não recebe:**

1. Verificar URL no painel MP
2. Ver logs: `pm2 logs server-marketplace | grep webhook`
3. Testar manualmente no painel MP

### **SQL não executa:**

1. Verificar se login está correto
2. Copiar arquivo completo (não por partes)
3. Aguardar terminar (pode demorar 10-15s)

### **API não responde:**

```bash
# Verificar status:
ssh root@72.60.144.245 "pm2 status"

# Reiniciar:
ssh root@72.60.144.245 "pm2 restart server-marketplace"

# Ver erros:
ssh root@72.60.144.245 "pm2 logs server-marketplace --err --lines 50"
```

---

## ✅ CHECKLIST FINAL

- [ ] SQL executado no Supabase
- [ ] 17+ tabelas criadas
- [ ] Realtime ativo em cycle_events
- [ ] Produto seed existe (KIT-SIGMA-1X6)
- [ ] Webhook MP configurado
- [ ] Teste webhook MP enviado
- [ ] API logs mostram "Servidor rodando"
- [ ] Admin acessível (https://admin.rsprolipsi.com.br)
- [ ] Pedido teste criado (opcional)
- [ ] Acumulador funcionando (opcional)

---

## 🎯 RESULTADO FINAL

**SISTEMA 100% OPERACIONAL!**

✅ **Backend:** rs-api rodando
✅ **Frontend:** Admin + Marketplace + Escritório
✅ **Database:** 17 tabelas + triggers
✅ **Webhook:** Mercado Pago ativo
✅ **Automação:** Realtime + rs-ops

**Pronto para produção!** 🚀🎉

---

**Última atualização:** 09/11/2024 16:48
**Status:** 95% → Faltam 2 cliques
