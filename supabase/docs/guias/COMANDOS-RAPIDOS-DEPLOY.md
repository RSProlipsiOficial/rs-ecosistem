# ⚡ COMANDOS RÁPIDOS - DEPLOY SIGMA

**Cole e execute na ordem!**

---

## 1️⃣ **SUPABASE - Executar SQLs**

### Acessar:
```
https://rptkhrboejbwexseikuo.supabase.co
→ SQL Editor
```

### Executar nesta ordem:

**SQL 1 - Tabelas Base:**
```sql
-- Copiar e colar todo conteúdo de:
-- rs-core/EXECUTAR-NO-SUPABASE.sql
```

**SQL 2 - Tabelas Novas:**
```sql
-- Copiar e colar todo conteúdo de:
-- rs-core/TABELAS-COMPLEMENTARES.sql
```

**SQL 3 - Triggers:**
```sql
-- Copiar e colar todo conteúdo de:
-- rs-core/VIEWS-E-TRIGGERS.sql
```

**SQL 4 - Verificar:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Deve ter 17+ tabelas
```

**SQL 5 - Habilitar Realtime:**
```
Dashboard → Database → Replication
→ Procurar: cycle_events
→ Ativar: ON
→ Save
```

---

## 2️⃣ **VPS - Upload Arquivos**

### Conectar:
```bash
ssh root@72.60.144.245
# Senha: Yannis784512@
```

### Upload (no seu PC):
```powershell
# Abrir PowerShell na pasta do projeto:
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-api"

# Upload services:
scp -r src\services root@72.60.144.245:/var/www/rs-api/src/

# Upload server.js:
scp server.js root@72.60.144.245:/var/www/rs-api/

# Upload webhook:
scp src\routes\webhook.routes.js root@72.60.144.245:/var/www/rs-api/src/routes/
```

### Instalar dependências (no VPS):
```bash
cd /var/www/rs-api
npm install @supabase/supabase-js --save
```

### Verificar .env (no VPS):
```bash
nano /var/www/rs-api/.env

# Deve ter:
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo
MP_ACCESS_TOKEN=APP_USR-7775914435593768-080212-ca91c8f829c87e5885ae7b4bf6ed74c5-2069869679
PORT=8080

# Salvar: Ctrl+O, Enter, Ctrl+X
```

### Reiniciar (no VPS):
```bash
pm2 restart rs-api
pm2 logs rs-api --lines 50
```

### ✅ Verificar se está rodando:
```bash
# Deve aparecer:
# ✅ Servidor rodando na porta 8080
# ✅ Listener ativo e escutando eventos de ciclo!
# 📡 Status do listener: SUBSCRIBED
```

---

## 3️⃣ **MERCADO PAGO - Webhook**

### Acessar:
```
https://www.mercadopago.com.br/developers
→ Suas integrações
→ Selecionar aplicação
→ Webhooks
```

### Configurar:
```
URL: https://api.rsprolipsi.com.br/api/webhook/mercadopago

Eventos:
☑ payment.created
☑ payment.updated

Salvar
```

### Testar:
```
Clicar em "Testar webhook"
```

### Monitorar (no VPS):
```bash
pm2 logs rs-api --lines 0
# Aguardar webhook aparecer:
# 🔔 Webhook MP recebido
```

---

## 4️⃣ **TESTE RÁPIDO**

### Criar produto teste (Supabase SQL):
```sql
INSERT INTO product_catalog (
  name, sku, price_base, price_consultor, price_cd,
  discount_consultor, discount_cd, contributes_to_matrix,
  status, slug
) VALUES (
  'Kit Teste SIGMA', 'KIT-TEST-001', 120.00, 60.00, 50.88,
  50.00, 57.60, true, 'active', 'kit-teste-sigma'
) RETURNING id;
```

### Criar consultor empresa (Supabase SQL):
```sql
INSERT INTO consultores (nome, email, cpf, status, patrocinador_id)
VALUES ('RS Empresa', 'empresa@rsprolipsi.com.br', '00000000000', 'ativo', NULL)
RETURNING id;

-- Copiar o ID retornado!
-- Exemplo: 123e4567-e89b-12d3-a456-426614174000
```

### Criar wallet empresa (Supabase SQL):
```sql
-- Usar o ID acima:
INSERT INTO wallets (user_id, consultor_id, balance)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000',
  0.00
);
```

### Criar consultor cliente (Supabase SQL):
```sql
INSERT INTO consultores (
  nome, email, cpf, telefone, status, patrocinador_id
) VALUES (
  'João Teste', 'joao@teste.com', '12345678901', '41999999999', 'ativo',
  '123e4567-e89b-12d3-a456-426614174000'  -- ID da empresa
) RETURNING id;

-- Copiar o ID!
-- Exemplo: 999e4567-e89b-12d3-a456-426614174111
```

### Criar wallet cliente (Supabase SQL):
```sql
INSERT INTO wallets (user_id, consultor_id, balance)
VALUES (
  '999e4567-e89b-12d3-a456-426614174111',
  '999e4567-e89b-12d3-a456-426614174111',
  0.00
);
```

### Verificar matriz (Supabase SQL):
```sql
-- Deve estar vazio ainda:
SELECT * FROM downlines;
SELECT * FROM matriz_cycles;
SELECT * FROM matrix_accumulator;
```

---

## 5️⃣ **MONITORAMENTO**

### Logs em tempo real (VPS):
```bash
pm2 logs rs-api
```

### Filtrar por tipo:
```bash
pm2 logs rs-api | grep "🎯"  # Ciclos
pm2 logs rs-api | grep "💰"  # Compras
pm2 logs rs-api | grep "❌"  # Erros
pm2 logs rs-api | grep "🔔"  # Webhooks
```

### Status:
```bash
pm2 status
curl https://api.rsprolipsi.com.br/health
```

### Dashboards SQL (Supabase):
```sql
-- Eventos de hoje:
SELECT * FROM cycle_events 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;

-- Ciclos abertos:
SELECT c.nome, mc.* 
FROM matriz_cycles mc
JOIN consultores c ON c.id = mc.consultor_id
WHERE mc.status = 'open';

-- Acumuladores:
SELECT c.nome, ma.accumulated_value, ma.total_activated
FROM matrix_accumulator ma
JOIN consultores c ON c.id = ma.consultor_id
ORDER BY ma.updated_at DESC;

-- Vendas de hoje:
SELECT * FROM sales 
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 6️⃣ **TROUBLESHOOTING RÁPIDO**

### ❌ "Tabela não encontrada"
```sql
-- Verificar tabelas:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### ❌ "Listener não conecta"
```bash
# Verificar Realtime ativado:
# Supabase → Database → Replication → cycle_events → ON

# Verificar logs:
pm2 logs rs-api | grep "listener"
```

### ❌ "Webhook não recebe"
```bash
# Testar localmente:
curl -X POST http://localhost:8080/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}'

# Verificar nginx:
sudo nginx -t
sudo systemctl reload nginx
```

### ❌ "Erro de conexão Supabase"
```bash
# Verificar .env:
cat /var/www/rs-api/.env | grep SUPABASE

# Testar conexão:
cd /var/www/rs-api
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL);"
```

---

## 7️⃣ **COMANDOS ÚTEIS**

### Reiniciar tudo:
```bash
pm2 restart all
```

### Ver processos:
```bash
pm2 list
```

### Limpar logs:
```bash
pm2 flush
```

### Salvar configuração PM2:
```bash
pm2 save
```

### Ver uso de recursos:
```bash
pm2 monit
```

---

## ✅ **CHECKLIST FINAL**

Antes de considerar pronto, verificar:

- [ ] SQLs executados no Supabase (3 arquivos)
- [ ] Realtime habilitado em `cycle_events`
- [ ] Arquivos enviados para VPS (services, server.js, webhook)
- [ ] `.env` com todas variáveis
- [ ] `pm2 restart rs-api` executado
- [ ] Logs mostram "Listener ativo"
- [ ] Webhook configurado no Mercado Pago
- [ ] Webhook testado e recebendo
- [ ] Produto teste criado
- [ ] Consultor empresa criado
- [ ] Consultor cliente criado
- [ ] Wallets criadas

**Se todos checkboxes ✅ → SISTEMA 100% OPERACIONAL!** 🚀

---

## 📞 **CONTATOS**

**VPS:** 72.60.144.245 (root / Yannis784512@)
**Supabase:** https://rptkhrboejbwexseikuo.supabase.co
**API:** https://api.rsprolipsi.com.br
**Admin:** https://admin.rsprolipsi.com.br

---

**Tempo total estimado:** 40-50 minutos ⏱️

🎉 **BOA SORTE NO DEPLOY!**
