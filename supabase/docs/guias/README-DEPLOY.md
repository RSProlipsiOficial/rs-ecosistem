# 🚀 DEPLOY COMPLETO - RS PRÓLIPSI

## ⚡ ESCOLHA SEU MÉTODO DE DEPLOY

---

### **MÉTODO 1: AUTOMÁTICO (RECOMENDADO)** 🤖

**Executa tudo automaticamente com 1 comando!**

#### **1. Execute o script:**
```powershell
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack"
.\deploy-automatico.ps1
```

#### **2. Depois, execute o SQL no Supabase:**
1. Acesse: https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new
2. Abra: `DEPLOY-SQL-COMPLETO-PRODUCAO.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique **RUN**

#### **3. Teste localmente:**
```powershell
# Admin
cd rs-admin
npm run preview

# Consultor (nova janela)
cd rs-consultor
npm run preview
```

✅ **PRONTO! Sistema funcionando!**

---

### **MÉTODO 2: MANUAL (PASSO A PASSO)** 📝

**Siga o guia detalhado:**

📄 Abra o arquivo: `GUIA-DEPLOY-PRODUCAO.md`

**7 passos simples:**
1. Executar SQL no Supabase
2. Instalar dependências (Consultor)
3. Configurar .env (Consultor)
4. Build do Consultor
5. Verificar .env (Admin)
6. Build do Admin
7. Testar localmente

---

## 📁 ARQUIVOS CRIADOS

### **Scripts de Deploy:**
- ✅ `deploy-automatico.ps1` - Script automático PowerShell
- ✅ `DEPLOY-SQL-COMPLETO-PRODUCAO.sql` - SQL consolidado
- ✅ `GUIA-DEPLOY-PRODUCAO.md` - Guia passo a passo

### **Documentação:**
- ✅ `COMUNICACAO-INTEGRADA-COMPLETA.md` - Guia completo da integração
- ✅ `rs-consultor/INSTALACAO-RAPIDA.md` - Guia rápido do consultor

---

## ✅ O QUE ESTÁ INCLUÍDO NO DEPLOY

### **Tabelas do Supabase (5 principais):**
1. `announcements` - Comunicados
2. `agenda_items` - Agenda comemorativa
3. `trainings` - Treinamentos
4. `catalogs` - Catálogos
5. `download_materials` - Materiais de download

### **Funcionalidades:**
- ✅ Admin: CRUD completo de comunicação
- ✅ Consultor: Visualização read-only
- ✅ Sincronização automática
- ✅ Contadores de download
- ✅ Triggers automáticos
- ✅ Dados iniciais (agenda)

---

## 🧪 COMO TESTAR

### **1. Teste no Admin:**
```bash
cd rs-admin
npm run preview
```
- Abra http://localhost:4173
- Vá em **Comunicação**
- Crie um comunicado de teste
- Salve

### **2. Teste no Consultor:**
```bash
cd rs-consultor
npm run preview
```
- Abra http://localhost:4173
- Vá em **Central de Comunicação**
- Verifique se o comunicado aparece

**Se aparecer = ✅ FUNCIONANDO!**

---

## 🌐 DEPLOY PARA SERVIDOR (VPS)

### **Informações do servidor:**
- **IP:** 72.60.144.245
- **User:** root
- **Senha:** Yannis784512@

### **Deploy Admin:**
```bash
cd rs-admin
npm run build
scp -r dist/* root@72.60.144.245:/var/www/admin/
```

### **Deploy Consultor:**
```bash
cd rs-consultor
npm run build
scp -r dist/* root@72.60.144.245:/var/www/consultor/
```

---

## 🐛 TROUBLESHOOTING

### **Script PowerShell não executa:**
```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy-automatico.ps1
```

### **Erro no build:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### **Não carrega dados:**
- Verifique se executou o SQL no Supabase
- Verifique se o .env tem as credenciais corretas
- Abra o console do navegador (F12) para ver erros

---

## 📊 CHECKLIST COMPLETO

- [ ] Script PowerShell executado OU passos manuais concluídos
- [ ] SQL executado no Supabase
- [ ] Tabelas criadas no Supabase
- [ ] Dependências instaladas
- [ ] Arquivos .env configurados
- [ ] Build do Admin concluído
- [ ] Build do Consultor concluído
- [ ] Teste local realizado
- [ ] Sincronização funcionando
- [ ] Deploy para servidor (opcional)

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Deploy de comunicação (ATUAL)
2. ⏳ Integrar Marketplace
3. ⏳ Configurar RLS no Supabase
4. ⏳ Adicionar métricas avançadas

---

## 📞 SUPORTE

### **Arquivos de ajuda:**
- `GUIA-DEPLOY-PRODUCAO.md` - Guia completo
- `COMUNICACAO-INTEGRADA-COMPLETA.md` - Documentação técnica
- `rs-consultor/INSTALACAO-RAPIDA.md` - Guia rápido

### **Logs úteis:**
```bash
# Ver o que está acontecendo no build
npm run build 2>&1 | tee build.log

# Ver processos Node.js rodando
ps aux | grep node

# Ver portas em uso
netstat -ano | findstr :4173
```

---

## 🏆 RESULTADO FINAL

**Após o deploy você terá:**

- ✅ Sistema de comunicação completo
- ✅ Admin gerenciando tudo
- ✅ Consultor visualizando em tempo real
- ✅ Banco de dados profissional
- ✅ Sincronização automática
- ✅ Pronto para produção!

**Tudo que criar no Admin aparece INSTANTANEAMENTE no Consultor!** 🚀

---

**Criado em:** 10/11/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para deploy
