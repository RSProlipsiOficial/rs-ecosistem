# ✅ RS PRÓLIPSI - Checklist de Setup da VPS

## 🎯 FASE 1: PREPARAÇÃO (Antes de começar)

- [ ] VS Code instalado no seu PC
- [ ] Extensão Remote-SSH instalada no VS Code
- [ ] Acesso SSH à VPS funcionando (`deploy@72.60.144.245`)
- [ ] Arquivo `setup-vps-dev-machine.sh` disponível

---

## 🚀 FASE 2: EXECUÇÃO DO SETUP

### Conexão

- [ ] Conectado na VPS via VS Code Remote-SSH
- [ ] Terminal aberto no VS Code
- [ ] Verificado que está como usuário `deploy` (comando: `whoami`)

### Instalação

- [ ] Script `setup-vps-dev-machine.sh` copiado/baixado
- [ ] Permissão de execução concedida (`chmod +x setup-vps.sh`)
- [ ] Script executado (`./setup-vps.sh`)
- [ ] Script finalizado sem erros críticos
- [ ] Terminal reiniciado ou `source ~/.bashrc` executado

---

## 🔍 FASE 3: VERIFICAÇÃO (Testes básicos)

### Ferramentas Instaladas

- [ ] Docker instalado e funcionando

  ```bash
  docker --version
  docker ps
  ```

- [ ] Node.js 20 instalado

  ```bash
  node -v
  # Deve mostrar: v20.x.x
  ```

- [ ] PNPM instalado

  ```bash
  pnpm -v
  ```

- [ ] PM2 instalado

  ```bash
  pm2 -v
  ```

### Repositórios Clonados

- [ ] Pasta `~/dev` criada
- [ ] 15 repositórios clonados em `~/dev/`

  ```bash
  ls ~/dev
  ```

- [ ] Arquivo `.env.template` criado em `~/dev/`

### Git Configurado

- [ ] Email configurado

  ```bash
  git config --global user.email
  # Deve mostrar: rsprolipsioficial@gmail.com
  ```

- [ ] Nome configurado

  ```bash
  git config --global user.name
  # Deve mostrar: RS Prólipsi
  ```

---

## 🎮 FASE 4: TESTE PRÁTICO

### Teste 1: Rodar um Projeto

- [ ] Entrou em um projeto (`cd ~/dev/rs-admin`)
- [ ] Copiou o .env (`cp ../.env.template .env`)
- [ ] Executou `pnpm run dev` (ou comando equivalente)
- [ ] Projeto rodou sem erros

### Teste 2: Git Push

- [ ] Fez uma alteração pequena em um arquivo
- [ ] Executou `git add .`
- [ ] Executou `git commit -m "test: verificação de setup"`
- [ ] Executou `git push`
- [ ] Push funcionou (usou o PAT como senha se necessário)

### Teste 3: Docker

- [ ] Executou `docker ps` sem erros
- [ ] Consegue rodar um container de teste

  ```bash
  docker run hello-world
  ```

### Teste 4: PM2

- [ ] Listou processos (`pm2 list`)
- [ ] Consegue iniciar um processo de teste

---

## 🛠️ FASE 5: FERRAMENTAS AUXILIARES

- [ ] Script `vps-helpers.sh` baixado
- [ ] Permissão de execução concedida
- [ ] Testado o menu interativo (`~/vps-helpers.sh`)
- [ ] Testado comando de atualização (`~/vps-helpers.sh update`)
- [ ] Testado comando de status (`~/vps-helpers.sh status`)

---

## 📊 FASE 6: VERIFICAÇÃO FINAL

### Saúde do Sistema

- [ ] Disco com espaço suficiente (`df -h`)
- [ ] Memória disponível (`free -h`)
- [ ] Todos os 15 projetos com `node_modules` instalados

### Funcionalidades Essenciais

- [ ] ✅ Pode desenvolver remotamente
- [ ] ✅ Pode fazer commits e push
- [ ] ✅ Pode rodar múltiplos projetos
- [ ] ✅ Pode usar Docker
- [ ] ✅ Pode usar PM2
- [ ] ✅ Tem todas as credenciais configuradas

---

## 🎯 CHECKLIST DE PROJETOS (15 total)

Marque conforme testa cada projeto:

- [ ] **rs-admin** - Testado e funcionando
- [ ] **rs-consultor** - Testado e funcionando
- [ ] **rs-marketplace** - Testado e funcionando
- [ ] **rs-api** - Testado e funcionando
- [ ] **rs-studio** - Testado e funcionando
- [ ] **rs-WalletPay** - Testado e funcionando
- [ ] **rs-logistica** - Testado e funcionando
- [ ] **rs-config** - Testado e funcionando
- [ ] **rs-site** - Testado e funcionando
- [ ] **rs-core** - Testado e funcionando
- [ ] **rs-docs** - Testado e funcionando
- [ ] **rs-rotafacil** - Testado e funcionando
- [ ] **rs-robo-kagi-binance** - Testado e funcionando
- [ ] **rs-template-game** - Testado e funcionando
- [ ] **rs-ops** - Testado e funcionando

---

## 🔐 CHECKLIST DE SEGURANÇA

- [ ] Senha do usuário `deploy` é forte
- [ ] Chave SSH configurada (opcional, mas recomendado)
- [ ] Firewall UFW configurado (se necessário)
- [ ] Apenas portas necessárias abertas
- [ ] GitHub PAT salvo em local seguro
- [ ] Credenciais não commitadas em repositórios

---

## 📝 CHECKLIST DE DOCUMENTAÇÃO

- [ ] Leu o `README-VPS.md`
- [ ] Leu o `VPS-SETUP-GUIDE.md`
- [ ] Conhece os comandos do `vps-helpers.sh`
- [ ] Sabe onde estão as credenciais (`~/dev/.env.template`)
- [ ] Sabe como rodar cada tipo de projeto

---

## 🚨 PROBLEMAS ENCONTRADOS

Use esta seção para anotar problemas durante o setup:

### Problema 1

- **Descrição:**
- **Solução:**
- **Status:** [ ] Resolvido / [ ] Pendente

### Problema 2

- **Descrição:**
- **Solução:**
- **Status:** [ ] Resolvido / [ ] Pendente

### Problema 3

- **Descrição:**
- **Solução:**
- **Status:** [ ] Resolvido / [ ] Pendente

---

## 🎉 SETUP COMPLETO

Quando todos os itens acima estiverem marcados, sua VPS está 100% pronta!

**Data de conclusão:** _**/**_/______

**Tempo total gasto:** _____ minutos

**Observações finais:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 📞 PRÓXIMOS PASSOS RECOMENDADOS

Após completar este checklist:

1. [ ] Configurar Nginx para proxy reverso
2. [ ] Configurar SSL/HTTPS com Let's Encrypt
3. [ ] Configurar CI/CD com GitHub Actions
4. [ ] Configurar backups automáticos
5. [ ] Configurar monitoramento (Grafana/Prometheus)
6. [ ] Configurar alertas (Discord/Slack/Email)
7. [ ] Documentar processos específicos do projeto
8. [ ] Treinar equipe no uso da VPS

---

**✨ Parabéns por completar o setup da VPS RS Prólipsi! ✨**
