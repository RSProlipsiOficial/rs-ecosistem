# 🚀 RS PRÓLIPSI - Guia Completo de Setup da VPS

## 📋 Informações da VPS

- **Provedor:** Hostinger VPS
- **IP:** `72.60.144.245`
- **Sistema:** Ubuntu 24.04 LTS
- **Hostname:** `srv990916.hstgr.cloud`
- **Usuário:** `deploy`

---

## 🎯 O QUE SERÁ INSTALADO

✅ **Docker + Docker Compose** - Para containers  
✅ **Node.js 20 + PNPM** - Runtime e gerenciador de pacotes  
✅ **PM2** - Gerenciador de processos  
✅ **Git configurado** - Para commits automáticos  
✅ **Todos os 15 repositórios clonados** - Prontos para desenvolvimento  
✅ **Dependências instaladas** - Em todos os projetos  
✅ **Variáveis de ambiente** - Template com todas as credenciais  

---

## 🔧 PASSO A PASSO

### 1️⃣ Conectar na VPS pelo VS Code

Você já deve ter feito isso, mas se precisar reconectar:

```bash
# No VS Code, pressione F1 e digite:
Remote-SSH: Connect to Host...
# Digite: deploy@72.60.144.245
```

### 2️⃣ Verificar se está como usuário deploy

No terminal do VS Code (conectado na VPS), execute:

```bash
whoami
```

Se retornar `root`, mude para o usuário `deploy`:

```bash
su - deploy
```

### 3️⃣ Baixar o script de setup

```bash
# Criar pasta temporária
mkdir -p ~/temp
cd ~/temp

# Baixar o script (você vai colar o conteúdo)
nano setup-vps.sh
```

**Cole o conteúdo do arquivo `setup-vps-dev-machine.sh` e salve:**
- `Ctrl + O` para salvar
- `Enter` para confirmar
- `Ctrl + X` para sair

### 4️⃣ Dar permissão de execução

```bash
chmod +x setup-vps.sh
```

### 5️⃣ Executar o script

```bash
./setup-vps.sh
```

⏱️ **Tempo estimado:** 10-15 minutos

O script vai:
1. Atualizar o sistema
2. Instalar Docker
3. Instalar Node 20 via NVM
4. Instalar PNPM globalmente
5. Instalar PM2
6. Clonar todos os 15 repositórios
7. Instalar dependências em cada projeto
8. Configurar Git
9. Criar template de variáveis de ambiente

### 6️⃣ Reiniciar o terminal

Após o script finalizar, feche e reabra o terminal do VS Code ou execute:

```bash
source ~/.bashrc
source ~/.nvm/nvm.sh
```

### 7️⃣ Verificar instalações

```bash
# Verificar Docker
docker --version
docker ps

# Verificar Node
node -v
# Deve retornar: v20.x.x

# Verificar PNPM
pnpm -v

# Verificar PM2
pm2 -v

# Verificar Git
git config --global user.email
# Deve retornar: rsprolipsioficial@gmail.com
```

---

## 📁 ESTRUTURA CRIADA

```
/home/deploy/
├── dev/
│   ├── rs-admin/
│   ├── rs-consultor/
│   ├── rs-marketplace/
│   ├── rs-api/
│   ├── rs-studio/
│   ├── rs-WalletPay/
│   ├── rs-logistica/
│   ├── rs-config/
│   ├── rs-site/
│   ├── rs-core/
│   ├── rs-docs/
│   ├── rs-rotafacil/
│   ├── rs-robo-kagi-binance/
│   ├── rs-template-game/
│   ├── rs-ops/
│   └── .env.template (com todas as credenciais)
└── .nvm/
    └── versions/
        └── node/
            └── v20.x.x/
```

---

## 🎮 COMO USAR APÓS O SETUP

### Rodar um projeto em desenvolvimento

```bash
# Entrar no projeto
cd ~/dev/rs-admin

# Copiar variáveis de ambiente (se necessário)
cp ../.env.template .env

# Rodar em modo dev
pnpm run dev
```

### Rodar com PM2 (produção)

```bash
cd ~/dev/rs-admin

# Buildar o projeto
pnpm run build

# Iniciar com PM2
pm2 start npm --name "rs-admin" -- start

# Ver logs
pm2 logs rs-admin

# Parar
pm2 stop rs-admin

# Reiniciar
pm2 restart rs-admin
```

### Fazer commits e push

```bash
cd ~/dev/rs-admin

# Fazer alterações...
git add .
git commit -m "feat: nova funcionalidade"

# Push (vai pedir autenticação na primeira vez)
git push
```

**Na primeira vez que fizer push, use o PAT como senha:**
```
Username: RSProlipsiOficial
Password: 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
```

### Atualizar repositórios

```bash
# Atualizar um projeto específico
cd ~/dev/rs-admin
git pull

# Atualizar todos os projetos (script rápido)
for d in ~/dev/*; do
  if [ -d "$d/.git" ]; then
    echo "Atualizando $(basename $d)..."
    cd "$d"
    git pull
  fi
done
```

---

## 🐳 COMANDOS DOCKER ÚTEIS

```bash
# Ver containers rodando
docker ps

# Ver todos os containers
docker ps -a

# Ver imagens
docker images

# Rodar um container (exemplo: PostgreSQL)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=Yannis784512@ \
  -p 5432:5432 \
  postgres:15

# Ver logs de um container
docker logs postgres

# Parar um container
docker stop postgres

# Remover um container
docker rm postgres

# Docker Compose (se o projeto tiver docker-compose.yml)
docker compose up -d
docker compose down
docker compose logs -f
```

---

## 🔥 COMANDOS PM2 ÚTEIS

```bash
# Listar processos
pm2 list

# Ver logs de todos
pm2 logs

# Ver logs de um específico
pm2 logs rs-admin

# Parar todos
pm2 stop all

# Reiniciar todos
pm2 restart all

# Deletar todos
pm2 delete all

# Salvar configuração atual
pm2 save

# Configurar para iniciar no boot
pm2 startup
# (copie e execute o comando que aparecer)
```

---

## 🌐 EXPOR PORTAS (se necessário)

Se você quiser acessar um serviço da VPS externamente:

```bash
# Verificar firewall
sudo ufw status

# Permitir porta específica
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp

# Habilitar firewall (se não estiver)
sudo ufw enable
```

---

## 📝 VARIÁVEIS DE AMBIENTE

O script criou um arquivo `~/dev/.env.template` com todas as credenciais.

Para usar em um projeto:

```bash
cd ~/dev/rs-admin
cp ../.env.template .env

# Editar se necessário
nano .env
```

**Credenciais incluídas:**
- ✅ Supabase (URL + Keys)
- ✅ OpenRouter API (RS-IA)
- ✅ Eleven Labs
- ✅ Melhor Envio
- ✅ Asaas
- ✅ Mercado Pago

---

## 🚨 TROUBLESHOOTING

### Erro: "docker: command not found"

```bash
# Reiniciar terminal ou executar
source ~/.bashrc

# Se não funcionar, fazer logout e login novamente
exit
# Reconectar no VS Code
```

### Erro: "nvm: command not found"

```bash
source ~/.nvm/nvm.sh
source ~/.bashrc
```

### Erro ao clonar repositórios

Verifique se o PAT está correto no script. Se expirou, gere um novo em:
https://github.com/settings/tokens

### Porta já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Matar o processo
sudo kill -9 <PID>
```

### Sem espaço em disco

```bash
# Ver uso de disco
df -h

# Limpar Docker
docker system prune -a

# Limpar node_modules antigos
find ~/dev -name "node_modules" -type d -prune -exec rm -rf {} +
# Depois reinstalar: cd ~/dev/projeto && pnpm install
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Configurar Nginx** - Para proxy reverso e SSL
2. **Configurar CI/CD** - GitHub Actions para deploy automático
3. **Configurar Backups** - Automatizar backup dos dados
4. **Monitoramento** - Instalar ferramentas de monitoramento
5. **Segurança** - Configurar fail2ban e hardening

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs: `pm2 logs` ou `docker logs <container>`
2. Verifique o status: `pm2 status` ou `docker ps`
3. Reinicie o serviço: `pm2 restart <app>` ou `docker restart <container>`

---

## ✅ CHECKLIST PÓS-SETUP

- [ ] Docker funcionando (`docker ps`)
- [ ] Node 20 instalado (`node -v`)
- [ ] PNPM instalado (`pnpm -v`)
- [ ] PM2 instalado (`pm2 -v`)
- [ ] Todos os 15 repos clonados (`ls ~/dev`)
- [ ] Git configurado (`git config --global user.email`)
- [ ] Consegue fazer commit e push
- [ ] Consegue rodar um projeto (`cd ~/dev/rs-admin && pnpm run dev`)

---

**🎉 Parabéns! Sua VPS agora é uma máquina de desenvolvimento completa!**
