# 🗄️ EXECUTAR SQL NO SUPABASE

## ✅ PASSO A PASSO PROFISSIONAL:

### **1. Acesse o Supabase:**
```
https://rptkhrboejbwexseikuo.supabase.co
```

### **2. Vá para SQL Editor:**
- No menu lateral esquerdo
- Clique em **"SQL Editor"**
- Clique no botão **"+ New Query"**

### **3. Execute o SQL:**
- Abra o arquivo: **`SQL-COMUNICACAO-SUPABASE.sql`**
- Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
- Cole no SQL Editor (Ctrl+V)
- Clique no botão **"RUN"** (ou Ctrl+Enter)

### **4. Aguarde a execução:**
- O Supabase vai executar todos os comandos
- Vai demorar cerca de 10-15 segundos
- Você verá mensagens de sucesso/erro

### **5. Verificação:**
Após executar, vá em **"Table Editor"** e verifique se essas tabelas foram criadas:

✅ `announcements`
✅ `agenda_items`
✅ `trainings`
✅ `training_lessons`
✅ `training_progress`
✅ `catalogs`
✅ `download_materials`
✅ `download_logs`
✅ `content_tags`
✅ `content_tag_relations`

---

## ⚠️ POSSÍVEIS ERROS:

### **"relation already exists"**
✅ **Normal!** Significa que a tabela já existe. Pode ignorar.

### **"permission denied"**
❌ **Problema!** Você não tem permissão. Use uma conta admin.

### **"syntax error"**
❌ **Problema!** Algum comando SQL está incorreto. Revise o arquivo.

---

## 🔄 SE ALGO DER ERRADO:

### **Opção 1: Executar em partes**
Execute o SQL em blocos menores (uma tabela por vez).

### **Opção 2: Limpar e recomeçar**
```sql
-- CUIDADO: Isso vai deletar todas as tabelas!
DROP TABLE IF EXISTS content_tag_relations CASCADE;
DROP TABLE IF EXISTS content_tags CASCADE;
DROP TABLE IF EXISTS download_logs CASCADE;
DROP TABLE IF EXISTS download_materials CASCADE;
DROP TABLE IF EXISTS catalogs CASCADE;
DROP TABLE IF EXISTS training_progress CASCADE;
DROP TABLE IF EXISTS training_lessons CASCADE;
DROP TABLE IF EXISTS trainings CASCADE;
DROP TABLE IF EXISTS agenda_items CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
```

Depois execute o SQL completo novamente.

---

## ✅ APÓS EXECUTAR:

Me avise que eu continuo com a integração no Admin, Escritório e Marketplace!

---

## 🎯 ARQUIVOS CRIADOS:

1. ✅ **SQL-COMUNICACAO-SUPABASE.sql** - SQL completo
2. ✅ **src/services/communicationAPI.ts** - API TypeScript
3. ✅ **.env** - Credenciais atualizadas
4. ✅ **Este arquivo** - Instruções

---

**Próximos passos:**
1. Executar SQL ✅ (você vai fazer agora)
2. Modificar Admin para usar Supabase ⏳ (eu faço depois)
3. Modificar Escritório (modo leitura) ⏳ (eu faço depois)
4. Modificar Marketplace (modo leitura) ⏳ (eu faço depois)
