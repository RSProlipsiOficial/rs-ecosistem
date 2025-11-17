#!/usr/bin/env bash
set -euo pipefail

echo "=== RS PROLIPSI • PREPARANDO VPS COMO MÁQUINA DE DESENVOLVIMENTO ==="

# -----------------------------
# 1. Atualizações da VPS
# -----------------------------
echo ">>> Atualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y

# -----------------------------
# 2. Instalar Docker + Compose
# -----------------------------
echo ">>> Instalando Docker..."
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy

# -----------------------------
# 3. Node + PNPM via NVM
# -----------------------------
echo ">>> Instalando Node 20 + PNPM..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
source "$NVM_DIR/nvm.sh"
nvm install 20
npm install -g pnpm

# -----------------------------
# 4. Instalar PM2
# -----------------------------
echo ">>> Instalando PM2..."
npm install -g pm2

# -----------------------------
# 5. Criar pasta de trabalho
# -----------------------------
mkdir -p ~/dev
cd ~/dev

# -----------------------------
# 6. Definir PAT temporário
# -----------------------------
GITHUB_PAT="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"

# -----------------------------
# 7. Lista de repositórios
# -----------------------------
REPOS=(
  "rs-admin"
  "rs-consultor"
  "rs-marketplace"
  "rs-api"
  "rs-studio"
  "rs-WalletPay"
  "rs-logistica"
  "rs-config"
  "rs-site"
  "rs-core"
  "rs-docs"
  "rs-rotafacil"
  "rs-robo-kagi-binance"
  "rs-template-game"
  "rs-ops"
)

echo ">>> Clonando repositórios..."

for r in "${REPOS[@]}"; do
  if [ ! -d "$r" ]; then
    echo "Clonando $r..."
    git -c "http.extraHeader=Authorization: Bearer $GITHUB_PAT" clone "https://github.com/RSProlipsiOficial/$r.git" || true
  else
    echo "$r já existe, pulando..."
  fi
done

unset GITHUB_PAT

# -----------------------------
# 8. Instalar dependências
# -----------------------------
echo ">>> Instalando dependências em cada projeto..."
for d in ~/dev/*; do
  if [ -d "$d" ]; then
    echo "Instalando dependências em $(basename $d)..."
    cd "$d"
    if [ -f "package.json" ]; then
      pnpm install || npm install || true
    fi
  fi
done

# -----------------------------
# 9. Configurar Git Global
# -----------------------------
echo ">>> Configurando Git..."
git config --global user.email "rsprolipsioficial@gmail.com"
git config --global user.name "RS Prólipsi"

# -----------------------------
# 10. Criar arquivo de ambiente base
# -----------------------------
echo ">>> Criando template de variáveis de ambiente..."
cat > ~/dev/.env.template << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo

# OpenRouter (RS-IA)
OPENROUTER_API_KEY=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

# Eleven Labs
ELEVEN_LABS_API_KEY=sk_d2b6db47fbe02c47f49cf8889568ace549ccabb04226ff53

# Melhor Envio
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODZhZmM0MzRiMTNkYjFjZDRlYmJkMmI3NDNmODgyOWM1NDljMjUzNDAyYWE2MWJlYzZkNTZkMzc3MTE4ZDYyOGE3MjVkZTAyNTEwYzY0ZGIiLCJpYXQiOjE3NjIzNjc4MjMuMDQ0MjUxLCJuYmYiOjE3NjIzNjc4MjMuMDQ0MjUzLCJleHAiOjE3OTM5MDM4MjMuMDMxMzIyLCJzdWIiOiI5YzA4ZmYzMi1jNjMxLTQ4ZDUtOTFhZC1hYjY4NTlhYWZmMmQiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.atZFcupMz1fJMO29emf64txyhUbYmwuakvW7tEISxyefwmPEUaOckFHt8ZJ92UN7s6LAnie7kajAHJhYedD1NzQ8EqpbjjF6KbAdFMgjnex6rgRtlTQ467R8FJ1Yr7nBuAqytxZWnQpq7FT-qk61JmmB_TvG-t1P4KOgOvjWlnIC1fYClpaBuemE1bWXzrkCiRXASscK1CLdThYweByecywIUplsLUKvwSIyhggOHSltKk294o7J58MJ9I02YWPbzCMj_wc1lJtg32DwPf8sJh897TOE495Aw9bGgNZ8ldRvfj03Nzcd2IaxG-4wWTCbbMX4IZYulUfG-dv8E3-I82HPtGydX9zDA1vTfJTbfZx4qKE9w-xhXwzHxUWYcAyDx9rdHLz6pY4TjDqPwt4jhMmkmhkfIxnThXAsfEEVn0rM4TXyUxWoJ5VLVFhj8LbkpEI7NW9Sjj7-YCmHNaigdc9aew6XNPXFXWTeJchlAMWYACz-3nRJ_xzcqj_RG3NjTTxtedYJ7NNUTIG0ZflwZbIeB7pk_H6l7jBVg3vcZPWLYC4qMKfCntCIfsFYfBJrbWAGbJvT8K3G7gsaks4rrOJCllBP8e0Wm_7eog2vRvdqKUjUNVuLMK29PpWraXWv0LUMc3zyuMZm26DnI5GVXc4TYQciVam5QUYnQvPfQuY

# Asaas
ASAAS_API_KEY=9de0b2ef-9d5d-462d-87f7-1780650fbdb3

# Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=APP_USR-085abaa9-1d61-4eee-ba22-27f4c5f70fb5
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-7775914435593768-080212-ca91c8f829c87e5885ae7b4bf6ed74c5-2069869679
EOF

echo ""
echo "==================================================================="
echo "✅ VPS PREPARADA COM SUCESSO!"
echo "==================================================================="
echo ""
echo "📁 Seus projetos estão em: ~/dev/"
echo "🔧 Docker, Node 20, PNPM e PM2 instalados"
echo "📦 Dependências instaladas em todos os projetos"
echo "🔐 Git configurado para commits automáticos"
echo ""
echo "📝 Próximos passos:"
echo "   1. Reinicie o terminal ou execute: source ~/.bashrc"
echo "   2. Teste o Docker: docker ps"
echo "   3. Teste o Node: node -v"
echo "   4. Teste o PNPM: pnpm -v"
echo "   5. Entre em qualquer projeto: cd ~/dev/rs-admin"
echo "   6. Rode o projeto: pnpm run dev"
echo ""
echo "🌍 Agora sua VPS funciona como seu computador de desenvolvimento!"
echo "==================================================================="
