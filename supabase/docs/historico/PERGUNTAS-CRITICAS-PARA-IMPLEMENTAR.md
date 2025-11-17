# ❓ PERGUNTAS CRÍTICAS - IMPLEMENTAÇÃO FINAL

**Data:** 09/11/2024 01:30
**Status:** Preciso de informações específicas para completar a integração

---

## 🎯 **O QUE JÁ ENTENDI**

### ✅ **ESTRUTURA COMPLETA MAPEADA**

1. **Supabase tem TUDO:**
   - ✅ Tabela `product_catalog` (produtos)
   - ✅ Tabela `sales` (vendas)
   - ✅ Tabela `matriz_cycles` (ciclos SIGMA)
   - ✅ Tabela `consultores` (usuários)
   - ✅ Tabela `wallets` (carteiras)
   - ✅ Triggers automáticos (venda → matriz)

2. **API tem rotas:**
   - ✅ `/api/marketplace/orders` (criar pedido)
   - ✅ `/api/marketplace/products` (listar produtos)
   - ✅ `/api/webhook/mercadopago` (recebe pagamento)

3. **rs-ops tem lógica:**
   - ✅ `closeCycle()` - Distribui bônus
   - ✅ `payDepth()` - Profundidade
   - ✅ `payFidelity()` - Fidelidade
   - ✅ `payTopSigma()` - Top 10

---

## ❓ **PERGUNTAS CRÍTICAS (Produtos)**

### **1. ESTRUTURA DE PRODUTOS** 🔴 URGENTE

**Pergunta:** Qual produto específico ativa a matriz SIGMA?

**Opções que vi na documentação:**
- a) Kit Ativação Essencial (R$ 60,00)?
- b) Qualquer produto que custe R$ 60,00?
- c) Produtos marcados com `contributes_to_matrix = true`?
- d) Todos os produtos ativam matriz?

**Tabela atual (`product_catalog`):**
```sql
- price_base DECIMAL (Preço vitrine)
- price_consultor DECIMAL (Preço para consultor - 50% desconto)
- price_cd DECIMAL (Preço para CD - 57.6% desconto)
- contributes_to_matrix BOOLEAN (Se ativa matriz)
- matrix_cycle_value INTEGER (Quantas vagas preenche)
```

**Preciso saber:**
- [ ] Qual o nome exato do produto que ativa matriz?
- [ ] Qual o SKU dele?
- [ ] Ele já está cadastrado no Supabase?
- [ ] Se não, você quer que eu crie agora?

---

### **2. FLUXO DE COMPRA** 🔴 URGENTE

**Cenário:** Cliente compra no marketplace

**Preciso saber:**

#### **A) Quem pode comprar?**
- [ ] Apenas consultores cadastrados?
- [ ] Qualquer pessoa (cliente final)?
- [ ] Ambos?

#### **B) Como funciona o cadastro?**
- [ ] Cliente compra → Sistema cria consultor automaticamente?
- [ ] Cliente precisa se cadastrar ANTES de comprar?
- [ ] Admin cadastra o consultor manualmente?

#### **C) Quem é o "buyer_id" na tabela `sales`?**
```sql
buyer_id UUID REFERENCES consultores(id)
buyer_type VARCHAR(20) -- 'cliente', 'consultor', 'cd'
```
- [ ] Se cliente compra, ele vira consultor na hora?
- [ ] Ou fica como "cliente" e depois admin ativa?

---

### **3. INTEGRAÇÃO MERCADO PAGO** 🟡 IMPORTANTE

**Atualmente no webhook:**
```javascript
POST /api/webhook/mercadopago
→ Recebe evento "payment.approved"
→ ❌ NÃO faz nada (TODO)
```

**Preciso saber:**

#### **A) Estrutura do pedido:**
Quando crio um pedido em `/api/marketplace/orders`, ele retorna:
```json
{
  "id": "uuid-do-pedido",
  "user_id": "quem-comprou",
  "total": 60.00,
  "status": "pending"
}
```

**Pergunta:** Existe tabela `orders` separada de `sales`?
- [ ] `orders` = pedido (pode ter vários itens)
- [ ] `sales` = venda individual (1 produto)
- [ ] Ou é tudo na tabela `sales`?

#### **B) Como vincular MP com pedido:**
```javascript
// Quando crio pagamento no MP, passo:
external_reference: "ID-DO-PEDIDO"

// Quando webhook retorna aprovado:
payment.external_reference = "ID-DO-PEDIDO"
```

**Pergunta:** O `external_reference` é o ID do `orders` ou `sales`?

---

### **4. CADASTRO DE CONSULTORES** 🟡 IMPORTANTE

**Vi na tabela `consultores`:**
```sql
- patrocinador_id UUID (Quem indicou)
- linha_direta INTEGER (Qual linha 1-6)
- nivel_profundidade INTEGER (Nível na rede)
```

**Perguntas:**

#### **A) Indicação obrigatória?**
- [ ] Toda compra PRECISA ter um indicador (patrocinador)?
- [ ] Se sim, como funciona link de indicação?
  - marketplace.com/?ref=ID_CONSULTOR
  - marketplace.com/c/NOME_CONSULTOR
  - Outro formato?

#### **B) Se não tem indicador:**
- [ ] Vai para admin como patrocinador?
- [ ] Fica sem patrocinador (null)?
- [ ] Sistema escolhe automaticamente?

#### **C) Linha direta:**
```sql
linha_direta INTEGER -- 1 a 6
```
- [ ] Sistema escolhe automaticamente a primeira vaga livre?
- [ ] Admin define manualmente?
- [ ] Como funciona o spillover?

---

### **5. TABELA `orders` vs `sales`** 🟡 IMPORTANTE

**Vi que marketplace.controller usa:**
```javascript
createOrder() → supabase.rpc('create_order_with_items')
```

**Perguntas:**
- [ ] Essa RPC function `create_order_with_items` existe no Supabase?
- [ ] Ou preciso criar?
- [ ] Ela insere em `orders` E `sales`?
- [ ] Ou apenas `orders` e depois trigger cria `sales`?

---

### **6. CREDENCIAIS E AMBIENTE** 🟢 CONFIRMAÇÃO

**Vi nas credenciais:**
```
Supabase URL: https://rptkhrboejbwexseikuo.supabase.co
Mercado Pago Access Token: APP_USR-7775914435593768-...
VPS: 72.60.144.245
```

**Confirmar:**
- [ ] Estas credenciais estão em `.env` do rs-api?
- [ ] rs-api está rodando no VPS na porta 8080?
- [ ] PM2 está gerenciando rs-api?
- [ ] Webhook MP está apontando para `https://api.rsprolipsi.com.br/webhook/mercadopago`?

---

## 📋 **CHECKLIST DE DADOS NECESSÁRIOS**

### **PRODUTOS (Para eu criar/verificar)**

```
[ ] Nome do produto que ativa matriz: _________________
[ ] Preço: R$ _______
[ ] SKU: _________________
[ ] Já está no Supabase? (Sim/Não)
[ ] Se não, descrição do produto: _________________
```

### **FLUXO DE CADASTRO**

```
[ ] Cliente compra → Vira consultor? (Sim/Não)
[ ] Indicação obrigatória? (Sim/Não)
[ ] Formato do link de indicação: _________________
[ ] Patrocinador padrão (se sem indicação): _________________
```

### **ESTRUTURA DE TABELAS**

```
[ ] Usar tabela `orders` + `sales`? (Sim/Não)
[ ] Se Sim, criar RPC create_order_with_items? (Sim/Não)
[ ] Se Não, usar apenas `sales`? (Sim/Não)
```

### **WEBHOOK MERCADO PAGO**

```
[ ] URL webhook configurada? _________________
[ ] external_reference = ID de qual tabela? _________________
[ ] Webhook está funcionando (recebendo eventos)? (Sim/Não)
```

---

## 🎯 **DECISÕES TÉCNICAS QUE POSSO TOMAR**

### **OPÇÃO 1: Fluxo Simplificado (RECOMENDADO)** ⭐

```
1. Cliente acessa marketplace
2. Adiciona produto ao carrinho
3. Faz checkout (preenche dados)
4. Sistema cria:
   - Consultor (se não existe)
   - Pedido (tabela orders)
   - Redireciona para MP
5. MP aprova pagamento
6. Webhook chama rs-api
7. rs-api insere em `sales` (com payment_status='completed')
8. TRIGGER Supabase automaticamente:
   - Cria/atualiza matriz_cycles
   - Preenche slot
   - Se 6 slots → completa ciclo
   - Dispara evento
9. rs-ops distribui bônus
```

**Vantagens:**
- ✅ Usa triggers que já existem
- ✅ Menos código manual
- ✅ Sistema automático

**Preciso confirmar:**
- Patrocinador vem do `?ref=` ou deixa null?
- Cliente vira consultor na hora ou depois?

---

### **OPÇÃO 2: Fluxo Com Aprovação Manual**

```
1-4. Igual acima
5. MP aprova
6. Webhook registra pagamento
7. Admin revisa e aprova consultor
8. Admin ativa matriz manualmente
9. Sistema processa bônus
```

**Desvantagens:**
- ❌ Precisa intervenção manual
- ❌ Mais lento

---

## 💡 **MINHA SUGESTÃO**

Vou assumir **OPÇÃO 1** com estas configurações:

### **Configurações Padrão:**
```javascript
// Produto que ativa matriz
const MATRIX_PRODUCT = {
  name: 'Kit Ativação Essencial RS Prólipsi',
  sku: 'KIT-ATIV-001',
  price_consultor: 60.00,
  contributes_to_matrix: true,
  matrix_cycle_value: 1
};

// Cadastro automático
const AUTO_CREATE_CONSULTOR = true;

// Link de indicação
const REF_PARAM = '?ref='; // marketplace.com/?ref=UUID

// Patrocinador padrão (sem indicação)
const DEFAULT_SPONSOR_ID = null; // ou ID do admin

// Tabelas
const USE_ORDERS_AND_SALES = true; // orders = pedido, sales = item
```

---

## ✅ **ME CONFIRME APENAS:**

**Responda com 1, 2 ou 3 para cada:**

### **1. Produto que ativa matriz:**
```
1. Kit Ativação Essencial R$ 60
2. Qualquer produto R$ 60
3. Outro: __________
```

### **2. Quando cliente compra:**
```
1. Vira consultor automaticamente
2. Admin precisa aprovar
3. Fica como cliente, não vira consultor
```

### **3. Link de indicação:**
```
1. ?ref=ID_CONSULTOR
2. /c/NOME_CONSULTOR
3. Não usa indicação
```

### **4. Se compra sem indicação:**
```
1. Fica sem patrocinador (null)
2. Vai para admin como patrocinador
3. Sistema escolhe automaticamente
```

---

**Com essas 4 respostas, EU IMPLEMENTO TUDO em 2-3 horas!** 🚀

Aguardando! 💪
