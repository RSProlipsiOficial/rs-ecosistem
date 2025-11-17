# 🔧 TESTE COMPLETO - SISTEMA DE COMUNICAÇÃO RS PRÓLIPSI

## ✅ **PROBLEMA CORRIGIDO**

**Diagnóstico:** O Consultor estava usando uma chave antiga do Supabase.  
**Solução:** Atualizadas todas as chaves para a versão oficial.

---

## 📋 **PASSO A PASSO PARA TESTAR**

### **1️⃣ VERIFICAR TABELAS NO SUPABASE**

Acesse o SQL Editor do Supabase:
```
https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new
```

Cole e execute o arquivo:
```
SQL-VERIFICACAO-AUTOMATICA.sql
```

**Resultado esperado:**
- ✅ Todas as 5 tabelas existem
- ✅ Funções e triggers configurados
- ✅ Dados iniciais da agenda presentes

Se aparecer ❌ em alguma tabela, execute:
```
DEPLOY-SQL-COMPLETO-PRODUCAO.sql
```

---

### **2️⃣ REINICIAR OS SERVIDORES DE DESENVOLVIMENTO**

#### **Admin:**
```powershell
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-admin"
npm run dev
```

Acesse: http://localhost:5173

#### **Consultor:**
```powershell
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\Documentação RS Prólipsi\rs-consultor"
npm run dev
```

Acesse: http://localhost:5174 (ou a porta exibida no terminal)

---

### **3️⃣ TESTAR NO ADMIN**

1. **Abra:** http://localhost:5173
2. **Navegue até:** Comunicação
3. **Crie um Comunicado:**
   - Clique em "+ Novo Comunicado"
   - Tipo: Info
   - Título: "Teste de Integração"
   - Conteúdo: "Este é um teste de integração com Supabase"
   - Marque "Publicado"
   - Clique em "Salvar"

4. **Verifique:**
   - Mensagem de sucesso apareceu?
   - O comunicado aparece na lista?

5. **Abra o Console do navegador** (F12):
   - **Não deve ter erros** em vermelho
   - Procure por mensagens do tipo:
     ```
     POST https://rptkhrboejbwexseikuo.supabase.co/rest/v1/announcements
     ```

---

### **4️⃣ TESTAR NO CONSULTOR**

1. **Abra:** http://localhost:5174
2. **Navegue até:** Comunicação
3. **Verifique:**
   - O comunicado "Teste de Integração" aparece?
   - A data está correta?
   - O ícone e tipo estão corretos?

4. **Abra o Console do navegador** (F12):
   - **Não deve ter erros** em vermelho
   - Deve aparecer algo como:
     ```
     GET https://rptkhrboejbwexseikuo.supabase.co/rest/v1/announcements?...
     ```

---

### **5️⃣ TESTAR SINCRONIZAÇÃO EM TEMPO REAL**

1. **Deixe Admin e Consultor abertos** lado a lado
2. **No Admin:** Crie um novo comunicado
3. **No Consultor:** Recarregue a página (F5)
4. **Deve aparecer** o novo comunicado criado

---

### **6️⃣ TESTAR OUTROS MÓDULOS**

#### **Agenda Comemorativa:**
- Admin → Comunicação → Agenda
- Adicione um item em "Boas-vindas"
- Verifique se aparece no Consultor

#### **Catálogos:**
- Admin → Comunicação → Catálogos
- Adicione um catálogo (URL ou arquivo)
- Verifique no Consultor

#### **Downloads:**
- Admin → Comunicação → Downloads
- Adicione um material
- Verifique no Consultor

---

## 🔍 **COMO IDENTIFICAR PROBLEMAS**

### **Erro 1: "No 'Access-Control-Allow-Origin' header"**
**Causa:** CORS bloqueado  
**Solução:** Configure RLS no Supabase (opcional para desenvolvimento)

### **Erro 2: "Failed to fetch" ou "Network Error"**
**Causa:** Chave do Supabase inválida  
**Solução:** Verificar se as chaves foram atualizadas corretamente

### **Erro 3: "relation 'announcements' does not exist"**
**Causa:** Tabelas não criadas no Supabase  
**Solução:** Execute `DEPLOY-SQL-COMPLETO-PRODUCAO.sql` no Supabase

### **Erro 4: Salva mas não aparece**
**Causa:** Campo `is_published` ou `published` false  
**Solução:** Marque "Publicado" ao criar

---

## 📊 **VERIFICAÇÃO RÁPIDA NO SUPABASE**

Execute este SQL para ver se os dados estão salvando:

```sql
-- Ver últimos comunicados
SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5;

-- Ver itens da agenda
SELECT * FROM agenda_items ORDER BY created_at DESC LIMIT 5;

-- Ver catálogos
SELECT * FROM catalogs ORDER BY created_at DESC LIMIT 5;

-- Ver materiais
SELECT * FROM download_materials ORDER BY created_at DESC LIMIT 5;
```

---

## 🎯 **CHECKLIST FINAL**

- [ ] Executei `SQL-VERIFICACAO-AUTOMATICA.sql` no Supabase
- [ ] Todas as tabelas existem (✅ verde)
- [ ] Reiniciei os servidores (Admin e Consultor)
- [ ] Criei um comunicado no Admin e ele salvou
- [ ] O comunicado aparece no Consultor
- [ ] Não há erros no Console do navegador (F12)
- [ ] Testei Agenda, Catálogos e Downloads

---

## 🚀 **DEPLOY EM PRODUÇÃO**

Quando tudo estiver funcionando localmente:

### **Admin (Vercel/Netlify):**
```bash
cd rs-admin
npm run build
# Fazer upload da pasta dist/
```

### **Consultor:**
```bash
cd rs-consultor
npm run build
# Fazer upload da pasta dist/
```

**Importante:** Certifique-se de que os arquivos `.env` de produção também têm a chave correta do Supabase.

---

## 📞 **SUPORTE**

Se ainda houver problemas:
1. Tire um print do Console (F12)
2. Tire um print da aba "Network" (requisições)
3. Execute o SQL de verificação e envie o resultado

---

## 🔑 **CREDENCIAIS**

```env
VITE_SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y
```

---

## ✅ **STATUS**

- ✅ Chaves do Consultor atualizadas
- ✅ Scripts SQL prontos
- ✅ APIs integradas (Admin e Consultor)
- ✅ Fluxo completo documentado
- 🟡 Aguardando testes do usuário

---

**Última atualização:** 11/02/2025  
**Versão:** 1.0
