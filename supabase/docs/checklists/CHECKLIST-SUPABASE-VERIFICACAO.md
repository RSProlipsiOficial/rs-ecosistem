# ✅ CHECKLIST DE VERIFICAÇÃO - SUPABASE

## 🔗 ACESSE O SUPABASE
https://supabase.com/dashboard/project/rptkhrboejbwexseikuo

---

## 📊 PASSO 1: VERIFICAR TABELAS (Table Editor)

Acesse: **Table Editor** (menu lateral)

### **COMUNICAÇÃO (5 tabelas principais):**
- [ ] `announcements` (comunicados)
- [ ] `agenda_items` (agenda comemorativa)
- [ ] `trainings` (treinamentos)
- [ ] `catalogs` (catálogos)
- [ ] `download_materials` (materiais de download)

### **Se TODAS as 5 estiverem presentes = ✅ BÁSICO OK!**

---

## 🔧 PASSO 2: VERIFICAR FUNÇÕES (SQL Editor)

Acesse: **SQL Editor** → **New query**

### **Execute este SQL para verificar funções:**

```sql
-- Verificar se as funções existem
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'increment_catalog_downloads', 'increment_material_downloads')
ORDER BY routine_name;
```

**Resultado esperado (3 funções):**
- [ ] `increment_catalog_downloads`
- [ ] `increment_material_downloads`
- [ ] `update_updated_at_column`

---

## 📋 PASSO 3: VERIFICAR DADOS INICIAIS

Acesse: **Table Editor** → `agenda_items`

**Deve ter pelo menos 4 registros:**
- [ ] "Mensagem de Boas-vindas" (Boas-vindas)
- [ ] "Parabéns pelo Aniversário!" (Aniversariantes)
- [ ] "Parabéns pela Nova Graduação!" (PINs)
- [ ] "Feliz Ano Novo!" (Datas Comemorativas)

---

## 🔍 PASSO 4: VERIFICAR ESTRUTURA DAS TABELAS

### **Announcements (comunicados):**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'announcements'
ORDER BY ordinal_position;
```

**Colunas esperadas:**
- [ ] id (uuid)
- [ ] type (varchar)
- [ ] title (varchar)
- [ ] content (text)
- [ ] is_new (boolean)
- [ ] published (boolean)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)
- [ ] created_by (varchar)

### **Agenda Items:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agenda_items'
ORDER BY ordinal_position;
```

**Colunas esperadas:**
- [ ] id (uuid)
- [ ] category (varchar)
- [ ] title (varchar)
- [ ] content (text)
- [ ] is_deletable (boolean)
- [ ] active (boolean)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)

### **Trainings:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trainings'
ORDER BY ordinal_position;
```

**Colunas esperadas:**
- [ ] id (uuid)
- [ ] title (varchar)
- [ ] description (text)
- [ ] category (varchar)
- [ ] cover_image (text)
- [ ] video_url (text)
- [ ] video_type (varchar)
- [ ] duration (integer)
- [ ] difficulty (varchar)
- [ ] order_index (integer)
- [ ] published (boolean)
- [ ] view_count (integer)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)
- [ ] created_by (varchar)

### **Catalogs:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'catalogs'
ORDER BY ordinal_position;
```

**Colunas esperadas:**
- [ ] id (uuid)
- [ ] title (varchar)
- [ ] description (text)
- [ ] cover_image (text)
- [ ] pdf_url (text)
- [ ] source_type (varchar)
- [ ] file_name (varchar)
- [ ] file_size (bigint)
- [ ] category (varchar)
- [ ] published (boolean)
- [ ] download_count (integer)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)
- [ ] created_by (varchar)

### **Download Materials:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'download_materials'
ORDER BY ordinal_position;
```

**Colunas esperadas:**
- [ ] id (uuid)
- [ ] title (varchar)
- [ ] description (text)
- [ ] icon_type (varchar)
- [ ] file_url (text)
- [ ] source_type (varchar)
- [ ] file_name (varchar)
- [ ] file_size (bigint)
- [ ] category (varchar)
- [ ] published (boolean)
- [ ] download_count (integer)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)
- [ ] created_by (varchar)

---

## 🎯 PASSO 5: TESTE RÁPIDO DE INTEGRAÇÃO

### **Teste 1: Inserir comunicado de teste**
```sql
INSERT INTO announcements (type, title, content, is_new, published)
VALUES ('info', 'TESTE - Deploy Funcionando', 'Se você está vendo isso, o sistema está funcionando!', true, true);
```

### **Teste 2: Verificar se foi inserido**
```sql
SELECT * FROM announcements WHERE title LIKE 'TESTE%' ORDER BY created_at DESC LIMIT 1;
```

### **Teste 3: Atualizar (testar trigger)**
```sql
UPDATE announcements 
SET title = 'TESTE - Deploy Funcionando - ATUALIZADO'
WHERE title = 'TESTE - Deploy Funcionando';
```

### **Teste 4: Verificar se updated_at mudou**
```sql
SELECT title, created_at, updated_at 
FROM announcements 
WHERE title LIKE 'TESTE%' 
ORDER BY created_at DESC LIMIT 1;
```

**Se updated_at for diferente de created_at = ✅ TRIGGER FUNCIONANDO!**

### **Teste 5: Limpar teste**
```sql
DELETE FROM announcements WHERE title LIKE 'TESTE%';
```

---

## 🔐 PASSO 6: VERIFICAR PERMISSÕES (OPCIONAL)

```sql
-- Ver políticas RLS (se tiver)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Se retornar vazio = Sem RLS (OK para agora)**

---

## 🌐 PASSO 7: TESTAR CONEXÃO DOS APLICATIVOS

### **A. Teste no Admin:**
1. Acesse: https://admin.rsprolipsi.com.br (ou seu domínio)
2. Vá em **Comunicação**
3. Tente criar um comunicado
4. **Se salvar sem erro = ✅ ADMIN OK!**

### **B. Teste no Consultor:**
1. Acesse: https://consultor.rsprolipsi.com.br (ou seu domínio)
2. Vá em **Central de Comunicação**
3. Veja se aparece o comunicado que criou no Admin
4. **Se aparecer = ✅ CONSULTOR OK!**

---

## ✅ RESUMO DO CHECKLIST

**BÁSICO (OBRIGATÓRIO):**
- [ ] 5 tabelas criadas
- [ ] 3 funções criadas
- [ ] 4 dados iniciais na agenda
- [ ] Admin consegue criar conteúdo
- [ ] Consultor consegue ver conteúdo

**AVANÇADO (OPCIONAL):**
- [ ] Todas as colunas corretas em cada tabela
- [ ] Triggers funcionando
- [ ] Testes de INSERT/UPDATE/DELETE funcionando
- [ ] RLS configurado (se necessário)

---

## 🐛 SE ALGO ESTIVER FALTANDO

### **Faltam tabelas:**
Execute o arquivo `DEPLOY-SQL-COMPLETO-PRODUCAO.sql` novamente

### **Faltam funções:**
```sql
-- Função de update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função de download de catálogo
CREATE OR REPLACE FUNCTION increment_catalog_downloads(catalog_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE catalogs SET download_count = download_count + 1 WHERE id = catalog_id;
END;
$$ LANGUAGE plpgsql;

-- Função de download de material
CREATE OR REPLACE FUNCTION increment_material_downloads(material_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE download_materials SET download_count = download_count + 1 WHERE id = material_id;
END;
$$ LANGUAGE plpgsql;
```

### **Faltam dados iniciais:**
```sql
INSERT INTO agenda_items (category, title, content, is_deletable) VALUES
    ('Boas-vindas', 'Mensagem de Boas-vindas', 'Bem-vindo(a) à família RS Prólipsi!', false),
    ('Aniversariantes', 'Parabéns pelo Aniversário!', 'Feliz aniversário!', false),
    ('PINs', 'Parabéns pela Nova Graduação!', 'Parabéns pela sua nova graduação!', false),
    ('Datas Comemorativas', 'Feliz Ano Novo!', 'Que o novo ano traga muitas realizações!', true)
ON CONFLICT DO NOTHING;
```

---

## 🎉 TUDO OK?

Se todos os checkboxes estiverem marcados:

✅ **Sistema 100% funcional!**
✅ **Admin salvando no Supabase**
✅ **Consultor lendo do Supabase**
✅ **Sincronização automática funcionando**

**ESTÁ PRONTO PARA USAR!** 🚀

---

**Execute este checklist e me diga o que está faltando (se houver)!**
