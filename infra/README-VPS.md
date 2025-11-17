# 🚀 RS PRÓLIPSI - Setup Completo da VPS

## 📦 Arquivos Criados

1. **`setup-vps-dev-machine.sh`** - Script principal de instalação
2. **`VPS-SETUP-GUIDE.md`** - Guia completo com todos os detalhes
3. **`vps-helpers.sh`** - Scripts auxiliares para operações diárias
4. **`README-VPS.md`** - Este arquivo (início rápido)

---

## ⚡ INÍCIO RÁPIDO (3 PASSOS)

### 1️⃣ Conectar na VPS

No VS Code, pressione `F1` e digite:

```text
Remote-SSH: Connect to Host...
```

Digite: `deploy@72.60.144.245`

### 2️⃣ Executar o Setup

No terminal do VS Code (conectado na VPS):

```bash
# Garantir que está como usuário deploy
whoami
# Se retornar "root", execute: su - deploy

# Baixar e executar o script
curl -o setup-vps.sh https://raw.githubusercontent.com/RSProlipsiOficial/rs-ecosystem/main/infra/setup-vps-dev-machine.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

**OU** copie o conteúdo do arquivo `setup-vps-dev-machine.sh` e cole no terminal.

### 3️⃣ Reiniciar Terminal

```bash
source ~/.bashrc
source ~/.nvm/nvm.sh
```

---

## ✅ VERIFICAR SE DEU CERTO

```bash
# Verificar instalações
docker --version
node -v
pnpm -v
pm2 -v

# Listar projetos clonados
ls ~/dev

# Testar um projeto
cd ~/dev/rs-admin
pnpm run dev
```

---

## 🎮 COMANDOS MAIS USADOS

### Rodar um projeto

```bash
cd ~/dev/rs-admin
cp ../.env.template .env
pnpm run dev
```

### Usar PM2 (produção)

```bash
cd ~/dev/rs-admin
pnpm run build
pm2 start npm --name "rs-admin" -- start
pm2 logs rs-admin
```

### Fazer commit e push

```bash
cd ~/dev/rs-admin
git add .
git commit -m "feat: nova funcionalidade"
git push
```

### Usar helpers (scripts auxiliares)

```bash
# Baixar helpers
curl -o ~/vps-helpers.sh https://raw.githubusercontent.com/RSProlipsiOficial/rs-ecosystem/main/infra/vps-helpers.sh
chmod +x ~/vps-helpers.sh

# Usar modo interativo
~/vps-helpers.sh

# Ou usar comandos diretos
~/vps-helpers.sh update    # Atualizar todos os repos
~/vps-helpers.sh install   # Instalar dependências
~/vps-helpers.sh status    # Ver status Git
~/vps-helpers.sh health    # Saúde do sistema
~/vps-helpers.sh list      # Listar projetos
```

---

## 📁 ESTRUTURA FINAL

```text
/home/deploy/
├── dev/
│   ├── rs-admin/           ✅ Clonado + deps instaladas
│   ├── rs-consultor/       ✅ Clonado + deps instaladas
│   ├── rs-marketplace/     ✅ Clonado + deps instaladas
│   ├── rs-api/             ✅ Clonado + deps instaladas
│   ├── rs-studio/          ✅ Clonado + deps instaladas
│   ├── rs-WalletPay/       ✅ Clonado + deps instaladas
│   ├── rs-logistica/       ✅ Clonado + deps instaladas
│   ├── rs-config/          ✅ Clonado + deps instaladas
│   ├── rs-site/            ✅ Clonado + deps instaladas
│   ├── rs-core/            ✅ Clonado + deps instaladas
│   ├── rs-docs/            ✅ Clonado + deps instaladas
│   ├── rs-rotafacil/       ✅ Clonado + deps instaladas
│   ├── rs-robo-kagi-binance/ ✅ Clonado + deps instaladas
│   ├── rs-template-game/   ✅ Clonado + deps instaladas
│   ├── rs-ops/             ✅ Clonado + deps instaladas
│   └── .env.template       ✅ Todas as credenciais
└── .nvm/
    └── versions/
        └── node/
            └── v20.x.x/    ✅ Node 20 instalado
```

---

## 🔑 CREDENCIAIS IMPORTANTES

Todas as credenciais estão em: `~/dev/.env.template`

- ✅ Supabase (URL + Keys)
- ✅ OpenRouter API (RS-IA)
- ✅ Eleven Labs
- ✅ Melhor Envio
- ✅ Asaas
- ✅ Mercado Pago

**GitHub PAT (para push):**

```text
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
```

---

## 🆘 PROBLEMAS COMUNS

### Docker não funciona

```bash
source ~/.bashrc
# Ou fazer logout e login novamente
```

### Node/NVM não encontrado

```bash
source ~/.nvm/nvm.sh
source ~/.bashrc
```

### Erro ao fazer push

Na primeira vez, use o PAT como senha:

```text
Username: RSProlipsiOficial
Password: [cole o PAT acima]
```

### Porta já em uso

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, veja: **`VPS-SETUP-GUIDE.md`**

---

## 🎯 PRÓXIMOS PASSOS

Após o setup básico, você pode:

1. **Configurar Nginx** - Para proxy reverso e SSL
2. **Configurar CI/CD** - Deploy automático via GitHub Actions
3. **Configurar Backups** - Automatizar backup dos dados
4. **Monitoramento** - Instalar ferramentas de monitoramento
5. **Segurança** - Configurar fail2ban e hardening

---

## 📞 INFORMAÇÕES DA VPS

- **IP:** `72.60.144.245`
- **Sistema:** Ubuntu 24.04 LTS
- **Usuário:** `deploy`
- **Senha:** `Yannis784512@`

---

## ✨ O QUE VOCÊ PODE FAZER AGORA

✅ Desenvolver remotamente como se fosse seu PC  
✅ Fazer commits e push direto da VPS  
✅ Rodar múltiplos projetos simultaneamente  
✅ Usar Docker para containers  
✅ Gerenciar processos com PM2  
✅ Deploy automático  

**🎉 Sua VPS agora é uma máquina de desenvolvimento completa!**
