# 🚀 GUIA COMPLETO DE DEPLOY - PRODUÇÃO

## ⚡ DEPLOY EM 7 PASSOS

---

## 📋 PASSO 1: EXECUTAR SQL NO SUPABASE

### **1.1 Acesse o Supabase:**
🔗 https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new

### **1.2 Copie e execute o SQL:**
📄 Arquivo: `DEPLOY-SQL-COMPLETO-PRODUCAO.sql`

**Ações:**
1. Abra o arquivo `DEPLOY-SQL-COMPLETO-PRODUCAO.sql`
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou Ctrl+Enter)

### **1.3 Verificar se criou:**
- Vá em **Table Editor** no Supabase
- Procure pelas tabelas:
  - ✅ announcements
  - ✅ agenda_items
  - ✅ trainings
  - ✅ catalogs
  - ✅ download_materials

**Se tudo aparecer = ✅ SUCESSO!**

---

## 📋 PASSO 2: INSTALAR DEPENDÊNCIAS (CONSULTOR)

```bash
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\Documentação RS Prólipsi\rs-consultor"
npm install @supabase/supabase-js
```

---

## 📋 PASSO 3: CONFIGURAR .ENV (CONSULTOR)

### **3.1 Criar arquivo .env.local:**

```bash
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\Documentação RS Prólipsi\rs-consultor"
copy .env.example .env.local
```

### **3.2 O arquivo .env.local já tem as credenciais corretas:**
```env
VITE_SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI
```

---

## 📋 PASSO 4: BUILD DO CONSULTOR

```bash
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\Documentação RS Prólipsi\rs-consultor"
npm run build
```

**Aguarde o build finalizar...**

---

## 📋 PASSO 5: VERIFICAR .ENV DO ADMIN

### **5.1 Abrir arquivo:**
📄 `rs-admin/.env`

### **5.2 Verificar se tem:**
```env
VITE_SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI
```

**Se não tiver, adicione essas linhas!**

---

## 📋 PASSO 6: BUILD DO ADMIN

```bash
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-admin"
npm run build
```

**Aguarde o build finalizar...**

---

## 📋 PASSO 7: TESTAR LOCALMENTE ANTES DO DEPLOY

### **7.1 Testar Admin:**
```bash
cd rs-admin
npm run preview
```
- Abra http://localhost:4173
- Vá em **Comunicação**
- Crie um comunicado de teste
- Verifique se salva sem erro

### **7.2 Testar Consultor:**
```bash
cd rs-consultor
npm run preview
```
- Abra http://localhost:4173
- Vá em **Central de Comunicação**
- Verifique se aparece o comunicado que criou no Admin

**Se aparecer = ✅ SINCRONIZAÇÃO FUNCIONANDO!**

---

## 🌐 DEPLOY PARA SERVIDOR (OPCIONAL)

### **Se quiser fazer deploy para o servidor VPS:**

#### **Admin:**
```bash
cd rs-admin
npm run build
scp -r dist/* root@72.60.144.245:/var/www/admin/
```

#### **Consultor:**
```bash
cd rs-consultor  
npm run build
scp -r dist/* root@72.60.144.245:/var/www/consultor/
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] SQL executado no Supabase sem erros
- [ ] Tabelas aparecem no Supabase Table Editor
- [ ] Dependência @supabase/supabase-js instalada no Consultor
- [ ] Arquivo .env.local criado no Consultor
- [ ] Arquivo .env verificado no Admin
- [ ] Build do Consultor concluído sem erros
- [ ] Build do Admin concluído sem erros
- [ ] Admin consegue criar comunicado
- [ ] Consultor consegue ver o comunicado
- [ ] Sincronização funcionando perfeitamente

---

## 🐛 TROUBLESHOOTING

### **Erro ao executar SQL:**
- Verifique se está logado no Supabase correto
- Tente executar em partes menores
- Verifique logs de erro no Supabase

### **Build falha no Consultor:**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Build falha no Admin:**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Consultor não carrega dados:**
- Verifique se .env.local existe
- Verifique se as credenciais estão corretas
- Abra o console do navegador (F12) para ver erros

### **Admin não salva dados:**
- Verifique se .env tem as credenciais
- Verifique se as tabelas existem no Supabase
- Abra o console do navegador (F12) para ver erros

---

## 📞 COMANDOS ÚTEIS

### **Ver preview local:**
```bash
# Admin
cd rs-admin && npm run preview

# Consultor
cd rs-consultor && npm run preview
```

### **Limpar e rebuildar:**
```bash
# Limpar
rm -rf dist node_modules package-lock.json

# Reinstalar e buildar
npm install
npm run build
```

### **Ver logs de build:**
```bash
npm run build > build.log 2>&1
type build.log
```

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Testar criação de conteúdo no Admin
2. ✅ Verificar se aparece no Consultor
3. ✅ Testar todos os tipos de conteúdo:
   - Comunicados
   - Agenda
   - Treinamentos
   - Catálogos
   - Materiais
4. ✅ Configurar domínios (se ainda não configurou)
5. ✅ Integrar Marketplace (próxima etapa)

---

## 🏆 RESUMO

**Depois desses 7 passos, você terá:**

- ✅ Todas as tabelas criadas no Supabase
- ✅ Admin funcional e salvando no banco
- ✅ Consultor funcional e lendo do banco
- ✅ Sincronização automática funcionando
- ✅ Sistema pronto para produção!

**TUDO que criar no Admin vai aparecer AUTOMATICAMENTE no Consultor!** 🚀

---

**Criado em:** 10/11/2025  
**Status:** Pronto para executar  
**Tempo estimado:** 15-20 minutos
